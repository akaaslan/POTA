import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback,
  ScrollView, Animated, StyleSheet, ViewStyle, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography, elevation, duration } from '../design/theme';

// ─────────────────────────────────────────────────────────────────────────────

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface SheetProps {
  visible:     boolean;
  onClose:     () => void;
  title?:      string;
  /** Sheet height as fraction of screen height. Default 0.88 */
  snapHeight?: number;
  /** Show drag handle. Default true */
  handle?:     boolean;
  /** Make sheet content scrollable. Default true */
  scrollable?: boolean;
  children:    React.ReactNode;
  contentStyle?: ViewStyle;
}

/**
 * Bottom sheet modal wrapper. Provides animated slide-up, dark overlay,
 * drag handle, and header with close button.
 *
 * Wrap each sheet screen's content with this component.
 *
 * @example
 * <Sheet visible={isOpen} onClose={onClose} title="Maç Detayı">
 *   <MatchContent match={match} />
 * </Sheet>
 */
export function Sheet({
  visible,
  onClose,
  title,
  snapHeight = 0.88,
  handle     = true,
  scrollable = true,
  children,
  contentStyle,
}: SheetProps) {
  const insets   = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue:         0,
        duration:        duration.normal,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, slideAnim]);

  const sheetHeight = SCREEN_HEIGHT * snapHeight;

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentWrapperProps = scrollable
    ? {
        showsVerticalScrollIndicator: false,
        contentContainerStyle:        { paddingBottom: insets.bottom + spacing.xl },
      }
    : { style: { paddingBottom: insets.bottom + spacing.xl } };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          s.sheet,
          { height: sheetHeight, transform: [{ translateY: slideAnim }] },
          elevation.sheet,
        ]}
      >
        {/* Drag handle */}
        {handle && <View style={s.handle} />}

        {/* Header */}
        {title ? (
          <View style={s.header}>
            <Text style={s.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.7}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Content */}
        <ContentWrapper {...(contentWrapperProps as object)} style={contentStyle}>
          {children}
        </ContentWrapper>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    backgroundColor: colors.bgCard,
    borderTopLeftRadius:  radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    overflow:        'hidden',
  },
  handle: {
    alignSelf:       'center',
    width:           40,
    height:          4,
    borderRadius:    radius.full,
    backgroundColor: colors.border,
    marginTop:       spacing.sm,
    marginBottom:    spacing.xs,
  },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: spacing.screen,
    paddingVertical:   spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    flex:  1,
  },
  closeBtn: {
    padding:         spacing.xs,
    marginLeft:      spacing.sm,
  },
  closeTxt: {
    ...typography.label,
    color: colors.textDim,
  },
});
