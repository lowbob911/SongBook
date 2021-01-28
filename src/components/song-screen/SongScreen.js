import React, { useState } from "react";
import {StyleSheet, Text} from 'react-native';

export default function SongScreen({navigation, route}){
    navigation.setOptions({ title: `${route.params.song.number}. ${route.params.song.title}`});

    return (
        <Text style={styles.view}>
            {route.params.song.text}
        </Text>
    )
}

const styles = StyleSheet.create({
    view: {
        padding: 10,
        fontSize: 18
    }
});
