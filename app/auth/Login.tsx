import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from 'lib/supabaseClient';
import { RootStackParamList } from '../../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
const router = useRouter();

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            Alert.alert('Login Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login to Pear 🍐</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            <Button title="Login" onPress={handleLogin} />
            <View style={styles.footer}>
                <Text>
                    Don’t have an account?{' '}
                    <Text style={styles.link} onPress={() => router.push('/auth/Signup')}>
                        Sign up
                    </Text>
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff', flex: 1, justifyContent: 'center', padding: 20 },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderColor: '#ccc',
        borderRadius: 10,
        borderWidth: 1,
        fontSize: 16,
        marginBottom: 8,
        padding: 12,
    },
    label: { fontSize: 16, fontWeight: '500', marginBottom: 4, marginTop: 12 },
    link: {
        color: '#007AFF',
        fontWeight: '500',
    },
    title: { fontSize: 28, fontWeight: '600', marginBottom: 24, textAlign: 'center' }
});
