import {FlatList, View, StyleSheet, TextInput} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import {SongsContext} from "../providers/SongsProvider";
import SongRow from "./view/SongRow";

export default function ListScreen({navigation}){
    const { songs } = useContext(SongsContext);
    const [ filteredSongs, setFilteredSongs ] = useState(songs);

    const onChangeText = (text) => {
        setFilteredSongs(songs.filter(s => s.title.toLowerCase().includes(text.toLowerCase()) || s.number.toString().startsWith(text)));
    };

    return (
        <View>
            <View style={{flexDirection:'row'}}>
                <TextInput
                    style={styles.filter}
                    autoFocus = {true}
                    onChangeText={text => onChangeText(text)}
                />
                <Ionicons name="md-search" size={32} color="#7499d4" style={styles.icon}/>
            </View>
            <FlatList
                data={filteredSongs}
                keyExtractor={item => item.key}
                renderItem={({item}) => <SongRow navigation={navigation} song={item}/>}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    filter: {
        height: 40,
        borderColor: '#7499d4',
        borderBottomWidth: 2,
        backgroundColor: 'white',
        paddingRight: 5,
        paddingLeft: 5,
        fontSize: 19,
        alignSelf: 'stretch',
        flex: 1
    },
    icon: {
        borderColor: '#7499d4',
        borderBottomWidth: 2,
        paddingTop: 3,
        paddingRight: 3,
        paddingBottom: 2,
        paddingLeft: 3,
        backgroundColor: 'white'
    }
});
