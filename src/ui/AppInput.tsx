import React, { useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity,
  StyleSheet, ViewStyle, TextInputProps,
} from 'react-native';
import { colors, radius, spacing, typography } from '../design/theme';

// ─────────────────────────────────────────────────────────────────────────────

interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?:       string;
  error?:       string;
  hint?:        string;
  leftIcon?:    React.ReactNode;
  rightIcon?:   React.ReactNode;
  onRightPress?: () => void;
  containerStyle?: ViewStyle;
}

/**
 * Styled text input consistent with the app's dark theme.
 * Supports label, error message, hint, and left/right icon slots.
 *
 * @example
 * <AppInput label="E-posta" placeholder="ornek@mail.com" keyboardType="email-address" />
 * <AppInput label="Şifre" secureTextEntry error={errors.password} />
 */
export function AppInput({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightPress,
  containerStyle,
  ...inputProps
}: AppInputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : focused
    ? colors.brand
    : colors.border;

  return (
    <View style={[s.container, containerStyle]}>
      {label ? <Text style={s.label}>{label}</Text> : null}

      <View style={[s.inputRow, { borderColor }]}>
        {leftIcon ? <View style={s.iconLeft}>{leftIcon}</View> : null}

        <TextInput
          style={[s.input, leftIcon ? s.inputWithLeft : null]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />

        {rightIcon ? (
          onRightPress ? (
            <TouchableOpacity style={s.iconRight} onPress={onRightPress} activeOpacity={0.7}>
              {rightIcon}
            </TouchableOpacity>
          ) : (
            <View style={s.iconRight}>{rightIcon}</View>
          )
        ) : null}
      </View>

      {error ? (
        <Text style={s.error}>{error}</Text>
      ) : hint ? (
        <Text style={s.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color:        colors.textDim,
    marginBottom: 2,
  },
  inputRow: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.bgCard2,
    borderWidth:     1,
    borderRadius:    radius.md,
    minHeight:       48,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex:     1,
    ...typography.body,
    color:    colors.text,
    paddingVertical: spacing.sm,
  },
  inputWithLeft: {
    paddingLeft: spacing.xs,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  error: {
    ...typography.labelSm,
    color: colors.error,
  },
  hint: {
    ...typography.labelSm,
    color: colors.textMuted,
  },
});
