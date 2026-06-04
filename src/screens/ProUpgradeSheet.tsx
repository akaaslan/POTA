import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { C, F, R, S } from '../theme';
import { t } from '../i18n';

const { height: SCREEN_H } = Dimensions.get('window');

var FEATURES = [
  { icon: '📊', title: t('proUpgrade.feature_analytics'), desc: t('proUpgrade.feature_analytics_desc') },
  { icon: '⚡', title: t('proUpgrade.feature_early'), desc: t('proUpgrade.feature_early_desc') },
  { icon: '🎯', title: t('proUpgrade.feature_badges'), desc: t('proUpgrade.feature_badges_desc') },
  { icon: '🏆', title: t('proUpgrade.feature_leaderboard'), desc: t('proUpgrade.feature_leaderboard_desc') },
  { icon: '🔔', title: t('proUpgrade.feature_notif'), desc: t('proUpgrade.feature_notif_desc') },
  { icon: '💬', title: t('proUpgrade.feature_chat'), desc: t('proUpgrade.feature_chat_desc') },
];

var PLANS = [
  { id: 'monthly', label: t('proUpgrade.plan_monthly'), price: '79 ₺', period: t('proUpgrade.plan_monthly_period'), savings: null, recommended: false },
  { id: 'yearly',  label: t('proUpgrade.plan_yearly'),  price: '599 ₺', period: t('proUpgrade.plan_yearly_period'), savings: t('proUpgrade.plan_savings'), recommended: true },
];

interface ProUpgradeSheetProps { open: boolean; onClose: () => void; onUpgrade: (plan: string) => void; }
export default function ProUpgradeSheet({ open, onClose, onUpgrade }: ProUpgradeSheetProps) {
  var [selectedPlan, setSelectedPlan] = useState('yearly');
  if (!open) return null;
  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose}>
      <View style={pr.root}>
        <TouchableOpacity style={pr.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={pr.sheet}>
          <TouchableOpacity style={pr.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={pr.closeIcon}>✕</Text>
          </TouchableOpacity>
          <View style={pr.handle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={pr.scroll}>
            {/* Hero */}
            <View style={pr.hero}>
              <View style={pr.heroGlow} />
              <Text style={pr.heroTag}>{t('proUpgrade.tag')}</Text>
              <Text style={pr.heroTitle}>{t('proUpgrade.title_1')}{"\n"}{t('proUpgrade.title_2')}</Text>
              <Text style={pr.heroSub}>{t('proUpgrade.subtitle')}</Text>
            </View>

            {/* Features */}
            {FEATURES.map(function(f) {
              return (
                <View key={f.title} style={pr.featureRow}>
                  <View style={pr.featureIconWrap}>
                    <Text style={pr.featureIcon}>{f.icon}</Text>
                  </View>
                  <View style={pr.featureText}>
                    <Text style={pr.featureTitle}>{f.title}</Text>
                    <Text style={pr.featureDesc}>{f.desc}</Text>
                  </View>
                </View>
              );
            })}

            {/* Plans */}
            <View style={pr.plansRow}>
              {PLANS.map(function(plan) {
                var isSelected = selectedPlan === plan.id;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[pr.planCard, plan.recommended && pr.planCardRec, isSelected && pr.planCardSelected]}
                    activeOpacity={0.85}
                    onPress={function() { setSelectedPlan(plan.id); }}
                  >
                    {plan.recommended ? (
                      <View style={pr.planRecBadge}>
                        <Text style={pr.planRecTxt}>{t('proUpgrade.plan_recommended')}</Text>
                      </View>
                    ) : null}
                    {plan.savings ? (
                      <Text style={pr.planSavings}>{plan.savings}</Text>
                    ) : <View style={{ height: 16 }} />}
                    <Text style={[pr.planLabel, plan.recommended && pr.planLabelRec]}>{plan.label}</Text>
                    <Text style={[pr.planPrice, plan.recommended && pr.planPriceRec]}>{plan.price}</Text>
                    <Text style={pr.planPeriod}>{plan.period}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={pr.ctaBtn} activeOpacity={0.85} onPress={function() { onUpgrade && onUpgrade(selectedPlan); }}>
              <Text style={pr.ctaTxt}>{t('proUpgrade.cta')}</Text>
            </TouchableOpacity>
            <Text style={pr.disclaimer}>{t('proUpgrade.disclaimer')}</Text>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const pr = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  sheet: {
    backgroundColor: C.bgCard,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    maxHeight: SCREEN_H * 0.92,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: S.screen,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: R.full,
    backgroundColor: C.bgCard2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: { color: C.textDim, fontSize: 13, fontWeight: '700' },
  scroll: { padding: S.screen },
  hero: { paddingTop: S.md, paddingBottom: S.x2, overflow: 'hidden' },
  heroGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: C.orange,
    opacity: 0.15,
  },
  heroTag: { color: C.orange, fontSize: F.xs, fontWeight: '900', letterSpacing: 2, marginBottom: S.sm },
  heroTitle: {
    color: C.text,
    fontSize: 38,
    fontWeight: '900',
    fontStyle: 'italic',
    lineHeight: 42,
    letterSpacing: -1,
  },
  heroSub: { color: C.textDim, fontSize: F.sm, marginTop: S.sm },
  featureRow: { flexDirection: 'row', gap: S.md, alignItems: 'flex-start', marginBottom: S.base },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: R.md,
    backgroundColor: 'rgba(255,91,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureIcon: { fontSize: 20 },
  featureText: { flex: 1, gap: 3 },
  featureTitle: { color: C.text, fontSize: F.sm, fontWeight: '800' },
  featureDesc: { color: C.textDim, fontSize: F.xs, lineHeight: 18 },
  plansRow: { flexDirection: 'row', gap: S.md, marginTop: S.x2, marginBottom: S.x2 },
  planCard: {
    flex: 1,
    backgroundColor: C.bgCard2,
    borderRadius: R.lg,
    padding: S.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    gap: 4,
    overflow: 'hidden',
    minHeight: 130,
  },
  planCardRec: { borderColor: C.orange, backgroundColor: 'rgba(255,91,0,0.08)' },
  planCardSelected: { borderColor: C.lime, backgroundColor: 'rgba(200,240,0,0.06)' },
  planRecBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: C.orange,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: R.sm,
  },
  planRecTxt: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  planSavings: { color: C.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 8 },
  planLabel: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 1.5 },
  planLabelRec: { color: C.orange },
  planPrice: { color: C.text, fontSize: F.xl, fontWeight: '900', letterSpacing: -0.5 },
  planPriceRec: { color: C.orange },
  planPeriod: { color: C.textDim, fontSize: F.xs },
  ctaBtn: {
    backgroundColor: C.orange,
    borderRadius: R.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: S.md,
  },
  ctaTxt: { color: '#fff', fontSize: F.sm, fontWeight: '900', letterSpacing: 2 },
  disclaimer: { color: C.textDim, fontSize: F.xs, textAlign: 'center', lineHeight: 18 },
});
