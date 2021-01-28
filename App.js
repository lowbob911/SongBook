import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SongsProvider from "./src/components/providers/SongsProvider";
import ListScreen from "./src/components/list-screen/ListScreen";
import SongScreen from "./src/components/song-screen/SongScreen";

const Stack = createStackNavigator();

export default function App() {
        return (
            <SongsProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="List">
                        <Stack.Screen name="List" component={ListScreen} options={{ title: 'Оглавление' }}/>
                        <Stack.Screen name="Song" component={SongScreen} />
                    </Stack.Navigator>
                </NavigationContainer>
            </SongsProvider>
        )
}
