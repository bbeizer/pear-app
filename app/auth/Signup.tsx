import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from 'lib/supabaseClient';
import { useRouter } from 'expo-router';
const router = useRouter();

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            Alert.alert('Sign-up Error', error.message);
        } else {
            Alert.alert('Success 🎉', 'Signup complete. Check your email!');
        }

        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign up for Pear 🍐</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button title={loading ? 'Signing up...' : 'Sign Up'} onPress={handleSignup} disabled={loading} />
            <View style={{ marginTop: 20 }}>
                <Text style={{ textAlign: 'center' }}>Already have an account?</Text>
                <Button title="Go to Login" onPress={() => router.push('/auth/Login')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
        justifyContent: 'center',
        padding: 20,
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
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
        marginTop: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 32,
        textAlign: 'center',
    },
});