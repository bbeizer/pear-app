import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ALL_PROMPTS = [
    "I'm weirdly attracted to...",
    "My most controversial opinion is...",
    "My hidden talent is...",
    "Two truths and a lie:",
    "The last song I listened to on repeat was...",
    "Dating me is like...",
    "My toxic trait is...",
    "My go-to karaoke song is...",
    "A shower thought I recently had...",
    "My hobbies are...",
    "I love...",
    "One dealbreaker for me is...",
    "The emoji that best describes me is...",
];

interface PromptSelectorProps {
    selectedPrompts: string[];
    promptAnswers: Record<string, string>;
    onPromptsChange: (prompts: string[]) => void;
    onAnswersChange: (answers: Record<string, string>) => void;
    maxPrompts?: number;
}

export default function PromptSelector({
    selectedPrompts,
    promptAnswers,
    onPromptsChange,
    onAnswersChange,
    maxPrompts = 3,
}: PromptSelectorProps) {
    const togglePrompt = (prompt: string) => {
        if (selectedPrompts.includes(prompt)) {
            // Remove prompt
            const newPrompts = selectedPrompts.filter(p => p !== prompt);
            const newAnswers = { ...promptAnswers };
            delete newAnswers[prompt];
            onPromptsChange(newPrompts);
            onAnswersChange(newAnswers);
        } else if (selectedPrompts.length < maxPrompts) {
            // Add prompt
            onPromptsChange([...selectedPrompts, prompt]);
        }
    };

    const updateAnswer = (prompt: string, answer: string) => {
        onAnswersChange({
            ...promptAnswers,
            [prompt]: answer,
        });
    };

    const renderPromptOption = (prompt: string) => {
        const isSelected = selectedPrompts.includes(prompt);

        return (
            <TouchableOpacity
                key={prompt}
                style={[
                    styles.promptOption,
                    isSelected && styles.selectedPrompt,
                ]}
                onPress={() => togglePrompt(prompt)}
            >
                <Text style={[
                    styles.promptText,
                    isSelected && styles.selectedPromptText,
                ]}>
                    {prompt}
                </Text>
                {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#00C48C" />
                )}
            </TouchableOpacity>
        );
    };

    const renderAnswerInput = (prompt: string) => {
        return (
            <View key={prompt} style={styles.answerContainer}>
                <Text style={styles.promptLabel}>{prompt}</Text>
                <TextInput
                    style={styles.answerInput}
                    value={promptAnswers[prompt] || ''}
                    onChangeText={(text) => updateAnswer(prompt, text)}
                    placeholder="Your answer..."
                    multiline
                    maxLength={150}
                />
                <Text style={styles.charCount}>
                    {(promptAnswers[prompt] || '').length}/150
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Prompts</Text>
            <Text style={styles.subtitle}>
                Choose up to {maxPrompts} prompts to answer. This helps others get to know you better!
            </Text>

            {/* Available Prompts */}
            <Text style={styles.sectionTitle}>Available Prompts</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.promptsRow}>
                    {ALL_PROMPTS.map(renderPromptOption)}
                </View>
            </ScrollView>

            {/* Selected Prompts with Answers */}
            {selectedPrompts.length > 0 && (
                <View style={styles.answersSection}>
                    <Text style={styles.sectionTitle}>Your Answers</Text>
                    {selectedPrompts.map(renderAnswerInput)}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#1A1A1A',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#1A1A1A',
    },
    promptsRow: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 8,
    },
    promptOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    selectedPrompt: {
        backgroundColor: '#00C48C',
        borderColor: '#00C48C',
    },
    promptText: {
        fontSize: 14,
        color: '#666',
    },
    selectedPromptText: {
        color: '#fff',
        fontWeight: '600',
    },
    answersSection: {
        marginTop: 16,
    },
    answerContainer: {
        marginBottom: 16,
    },
    promptLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: '#1A1A1A',
    },
    answerInput: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
}); 