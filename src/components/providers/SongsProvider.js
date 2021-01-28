import React, { Component, createContext } from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {versions as dbVersions} from "../../../sql/migrations";
import NetInfo from "@react-native-community/netinfo";
import * as firebase from "firebase";
import * as SQLite from "expo-sqlite";

const firebaseConfig = {
    apiKey: "AIzaSyB6jgAYZFaJhpzVcoZ9hox6h6iVGq6Ozqo",
    authDomain: "songreader-f7e8c.firebaseapp.com",
    databaseURL: "https://songreader-f7e8c.firebaseio.com",
    projectId: "songreader-f7e8c",
    storageBucket: "songreader-f7e8c.appspot.com",
    messagingSenderId: "703302008821",
    appId: "1:703302008821:web:579ee978ca657704"
};

firebase.initializeApp(firebaseConfig);

const localDb = SQLite.openDatabase('songs.db');

export const SongsContext = createContext();

export default class SongsProvider extends Component{
    state = {
        songs: null
    };

    componentDidMount(){
        localDb.transaction(tx => {
            tx.executeSql("SELECT count(name) FROM sqlite_master WHERE type='table' AND name='db_version'", [], (tx,rs) => {
                    const res = rs.rows.item(0)["count(name)"];
                    if(!res || res==0){
                        this.updateDb(0, tx);
                    } else {
                        tx.executeSql("SELECT value FROM db_version where name='version'", [], (tx,rs) => {
                            let version = rs.rows.item(0).value;
                            if(Math.max(...Object.keys(dbVersions).map(key => parseInt(key)))>version){
                                this.updateDb(version, tx);
                            }
                        }, (tx,err) => {console.log(err);})
                    }
                }
            );
        }, () => {}, () => {
            NetInfo.fetch().then(state => {
                if(state.isConnected){
                    if(state.type==='wifi'){
                        this.syncSongs();
                    } else {
                        localDb.transaction(tx => {
                            tx.executeSql("select value from db_version where name='last_sync'", [], (tx, rs) => {
                                if(rs.rows.length>0 && rs.rows.item(0).value){
                                    const lastSync = parseInt(rs.rows.item(0).value);
                                    const daysDiff = (Date.now() - lastSync) / (1000 * 3600 * 24);
                                    if(daysDiff>9){
                                        this.syncSongs();
                                    } else {
                                        this.loadSongs();
                                    }
                                } else {
                                    this.syncSongs();
                                }
                            });
                        }, (err) => console.log("get last sync error", err))
                    }
                } else {
                    this.loadSongs();
                }
            });
        });
    }

    syncSongs(){
        console.log("sync start");
        const cloudDb = firebase.database();
        cloudDb.ref('/songs').once('value').then((snapshot) => {
            const keys = [];
            snapshot.forEach(child => {
                keys.push(parseInt(child.key));
            });
            localDb.transaction(tx => {
                tx.executeSql(`select * from songs where id in (${keys.join(",")})`, [], (tx,rs) => {
                    const rows = rs.rows._array;
                    snapshot.forEach(child => {
                        const val = child.val();
                        const song = rows.find(song => song.id==child.key);
                        if(!song){
                            tx.executeSql("insert into songs (id, title, text, number, updated) values (?, ?, ?, ?, ?)", [child.key, val.title, val.text, val.number, val.updated], (tx, rs) => {
                                console.log("Song Added", child.key);
                            }, (tx, err) => {console.log("song add", err)});
                        } else if(song.updated<val.updated){
                            tx.executeSql("UPDATE songs set title=?, text=?, number=?, updated=? where id=?", [val.title, val.text, val.number, val.updated, child.key], (tx, rs) => {
                                console.log("Song Updated", child.key);
                            }, (tx,err) => {console.log(err)})
                        }
                    });

                    tx.executeSql(`delete from songs where id not in (${keys.join(",")})`, [], () => {
                        console.log("Songs removed");
                    })
                }, (tx,err) => {console.log(err);})
            }, err => {console.log(err)}, () => {this.loadSongs();});
        });
    }

    updateDb(version, tx){
        version++;
        while (dbVersions[version]){
            const curVersion = version;
            dbVersions[curVersion].forEach((statement, idx, array) => {
                tx.executeSql(statement, [], (tx,rs) => {
                    if(idx===array.length-1){
                        tx.executeSql("UPDATE db_version set value = ? where name='version'", [curVersion], () => {
                            console.log("db version "+ curVersion + " migrated ");
                        }, (tx,err) => {console.log(err)});
                    }
                }, (tx,err) => {console.log(err)});
            });
            version++;
        }
    }

    loadSongs(){
        localDb.transaction(tx => {
            tx.executeSql("select * from songs", [], (rx,rs) => {
                const songs = rs.rows._array;
                const res = [];
                songs.forEach(song => {
                    res.push({
                        key: song.id.toString(),
                        number: song.number,
                        title: song.title,
                        text: song.text
                    });
                });

                tx.executeSql("UPDATE db_version set value = ? where name='last_sync'", [Date.now().toString()], () => {
                    console.log("sync time updated");
                }, (tx,err) => {console.log(err)});

                this.setState({
                    songs: res
                })
            });
        });
    }

    render() {
        return this.state.songs ?
            (<SongsContext.Provider value={{songs:this.state.songs}}>
                {this.props.children}
            </SongsContext.Provider>) :
            (<View style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}>
                <ActivityIndicator size="large" color="#7499d4"/>
            </View>);
    }
}
