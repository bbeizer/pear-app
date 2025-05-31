import { Buffer } from 'buffer';
global.Buffer = Buffer;
global.process = require('process');
import 'react-native-url-polyfill/auto';

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './lib/supabaseClient';

import Signup from './screens/Signup';
import Login from './screens/Login';
import ProfileSetup from './screens/ProfileSetup';
import Availability from './screens/Availability';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './types'; // you create this

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    const [user, setUser] = useState<any>(null);
    const [profileComplete, setProfileComplete] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const session = supabase.auth.session?.(); // v1
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('name, avatar_url')
                    .eq('id', currentUser.id)
                    .single();

                if (profile && (profile.name || profile.avatar_url)) {
                    setProfileComplete(true);
                }
            }

            setLoading(false);
        };

        checkUser();

        supabase.auth.onAuthStateChange((_event, session) => {
            const newUser = session?.user ?? null;
            setUser(newUser);
        });
    }, []);

    if (loading) return null;

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {!user ? (
                    <>
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="Signup" component={Signup} />
                    </>
                ) : !profileComplete ? (
                    <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
                ) : (
                    <Stack.Screen name="Availability" component={Availability} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
