import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabaseClient';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        console.log('Attempting login with:', email);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                console.log('Login error:', error.message);
                Alert.alert('Login Error', error.message);
            } else {
                console.log('Login successful!');

                // Check if user has a profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', data.user?.id)
                    .single();

                if (profile) {
                    // User has profile, go to main app
                    router.replace('/main/');
                } else {
                    // User needs to set up profile
                    router.replace('/main/ProfileSetup');
                }
            }
        } catch (e) {
            console.log('Unexpected error during login:', e);
            Alert.alert('Unexpected Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
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

            <Button
                title={loading ? 'Logging in...' : 'Login'}
                onPress={handleLogin}
                disabled={loading}
            />
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