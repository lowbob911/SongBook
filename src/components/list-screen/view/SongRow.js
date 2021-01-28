import React from 'react';
import {StyleSheet, Text, TouchableHighlight} from "react-native";


export default function SongRow(props){
    return (
        <TouchableHighlight
            underlayColor="#C0C0C0"
            onPress={() => props.navigation.navigate('Song', {song: props.song})}>
            <Text style={styles.songRow}>
                {props.song.number} {props.song.title}
            </Text>
        </TouchableHighlight>
    );
}

const styles = StyleSheet.create({
    songRow: {
        fontSize: 19,
        fontWeight: 'bold',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderColor: 'grey',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 5,
        paddingRight: 5
    }
});
