
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { C, F, R, S } from '../theme';

function ChemBar({ value }) {
  var pct = Math.min(100, Math.max(0, value || 0));
  var barColor = pct >= 90 ? C.lime : pct >= 70 ? C.orange : C.red;
  return (
    <View style={sq.chemBlock}>
      <View style={sq.chemRow}>
        <Text style={sq.chemLabel}>TAKIM KİMYASI</Text>
        <Text style={[sq.chemVal, { color: barColor }]}>{pct}%</Text>
      </View>
      <View style={sq.chemTrack}>
        <View style={[sq.chemFill, { width: String(pct) + '%', backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

function FormBadge({ result }) {
  return (
    <View style={[sq.formBadge, { backgroundColor: result === 'W' ? C.green : C.red }]}>
      <Text style={sq.formTxt}>{result}</Text>
    </View>
  );
}

function RosterRow({ player, first }) {
  return (
    <View style={[sq.rosterRow, !first && sq.rosterBorder]}>
      <Image source={{ uri: player.avatar }} style={sq.rosterAvatar} />
      <View style={sq.rosterInfo}>
        <Text style={sq.rosterName}>{player.name}</Text>
        <Text style={sq.rosterArch}>{player.archetype}</Text>
      </View>
      <View style={sq.rosterStats}>
        {player.stats.map(function(st) {
          return (
            <View key={st.label} style={sq.rosterStat}>
              <Text style={sq.rosterStatVal}>{st.value}</Text>
              <Text style={sq.rosterStatLbl}>{st.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function OtherTeamCard({ team, onPress }) {
  return (
    <TouchableOpacity style={sq.otherCard} onPress={function() { onPress(team); }} activeOpacity={0.88}>
      <Image source={{ uri: team.logo }} style={sq.otherLogo} />
      <View style={sq.otherInfo}>
        <Text style={sq.otherName}>{team.name}</Text>
        <Text style={sq.otherMeta}>{team.district}  ·  {team.ranking}</Text>
        <View style={sq.otherFormRow}>
          {team.recentForm.map(function(f, i) { return <FormBadge key={String(i)} result={f.result} />; })}
        </View>
      </View>
      <View style={sq.otherRight}>
        <Text style={sq.otherChem}>{team.chemistry}%</Text>
        <Text style={sq.otherChemLbl}>KİMYA</Text>
        <Text style={sq.otherArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SquadScreen({ data, onOpenTeam, onOpenChat, onManageLineup }) {
  if (!data) {
    return <View style={sq.loading}><Text style={sq.loadingTxt}>YÜKLENIYOR...</Text></View>;
  }
  var myTeam = data.featuredTeam;
  var otherTeams = (data.teams || []).filter(function(t) { return !myTeam || t.id !== myTeam.id; });
  return (
    <View style={sq.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={sq.scroll}>
        {myTeam ? (
          <View style={sq.myTeam}>
            <View style={sq.teamHeader}>
              <Image source={{ uri: myTeam.logo }} style={sq.teamLogo} />
              <View style={sq.teamHeaderInfo}>
                <Text style={sq.teamRank}>{myTeam.ranking}</Text>
                <Text style={sq.teamName}>{myTeam.name}</Text>
                <Text style={sq.teamMeta}>{myTeam.district}  ·  Kur. {myTeam.established}</Text>
              </View>
            </View>
            <ChemBar value={myTeam.chemistry} />
            {myTeam.rivalry ? (
              <View style={sq.rivalryBanner}>
                <Text style={sq.rivalryTxt}>⚔️  {myTeam.rivalry}</Text>
              </View>
            ) : null}
            <View style={sq.statsGrid}>
              <View style={sq.statBox}>
                <Text style={sq.statBoxVal}>{myTeam.offensiveRating}</Text>
                <Text style={sq.statBoxLbl}>HÜCUM PUANI</Text>
                <Text style={sq.statBoxSub}>{myTeam.offensiveRankText}</Text>
              </View>
              <View style={sq.statBox}>
                <Text style={sq.statBoxVal}>{myTeam.winStreak}</Text>
                <Text style={sq.statBoxLbl}>GALİBİYET SERİSİ</Text>
                <Text style={sq.statBoxSub}>{myTeam.winStreakText}</Text>
              </View>
              <View style={sq.statBox}>
                <Text style={sq.statBoxVal}>{myTeam.defensiveRank}</Text>
                <Text style={sq.statBoxLbl}>SAVUNMA SIRASI</Text>
              </View>
            </View>
            <View style={sq.formRow}>
              <Text style={sq.sectionLbl}>SON FORM</Text>
              <View style={sq.formBadges}>
                {myTeam.recentForm.map(function(f, i) { return <FormBadge key={String(i)} result={f.result} />; })}
              </View>
            </View>
            <View style={sq.rosterSection}>
              <View style={sq.rosterHead}>
                <Text style={sq.sectionLbl}>KADRO ({myTeam.rosterSize} OYUNCU)</Text>
                <TouchableOpacity onPress={onManageLineup}>
                  <Text style={sq.manageBtn}>KADROYU DÜZENLE</Text>
                </TouchableOpacity>
              </View>
              <View style={sq.rosterCard}>
                {myTeam.roster.map(function(player, i) {
                  return <RosterRow key={player.name} player={player} first={i === 0} />;
                })}
              </View>
            </View>
            {myTeam.winStreakText ? (
              <View style={sq.streakBanner}>
                <Text style={sq.streakTxt}>🔥  {myTeam.winStreakText}</Text>
              </View>
            ) : null}
            <View style={sq.chatPreview}>
              <View style={sq.chatHead}>
                <Text style={sq.sectionLbl}>EKİP CHATI</Text>
                {myTeam.chatUnread > 0 ? (
                  <View style={sq.unreadBadge}><Text style={sq.unreadTxt}>{myTeam.chatUnread}</Text></View>
                ) : null}
              </View>
              {(myTeam.chatPreview || []).map(function(msg, i) {
                return (
                  <View key={String(i)} style={sq.chatMsg}>
                    <Text style={sq.chatAuthor}>{msg.author}</Text>
                    <Text style={sq.chatTxt} numberOfLines={1}>{msg.text}</Text>
                  </View>
                );
              })}
              <TouchableOpacity style={sq.chatBtn} onPress={onOpenChat} activeOpacity={0.85}>
                <Text style={sq.chatBtnTxt}>CHATI AÇ  →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        {otherTeams.length > 0 ? (
          <View style={sq.otherSection}>
            <Text style={sq.sectionLblTop}>DİĞER TAKIMLAR</Text>
            {otherTeams.map(function(team) {
              return <OtherTeamCard key={team.id} team={team} onPress={onOpenTeam} />;
            })}
          </View>
        ) : null}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const sq = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingTxt: { color: C.textDim, fontSize: F.xs, letterSpacing: 3, fontWeight: '700' },
  scroll: { padding: S.screen },
  myTeam: { marginBottom: S.x2 },
  teamHeader: { flexDirection: 'row', alignItems: 'center', gap: S.base, marginBottom: S.lg },
  teamLogo: { width: 64, height: 64, borderRadius: R.full, backgroundColor: C.bgCard2, borderWidth: 2, borderColor: C.border },
  teamHeaderInfo: { flex: 1 },
  teamRank: { color: C.lime, fontSize: F.xs, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  teamName: { color: C.text, fontSize: F.x2, fontWeight: '900', letterSpacing: 0.2 },
  teamMeta: { color: C.textDim, fontSize: F.xs, marginTop: 4 },
  chemBlock: { marginBottom: S.lg },
  chemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm },
  chemLabel: { color: C.textDim, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5 },
  chemVal: { fontSize: F.md, fontWeight: '900' },
  chemTrack: { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  chemFill: { height: '100%', borderRadius: 3 },
  rivalryBanner: { backgroundColor: 'rgba(255,91,0,0.1)', borderRadius: R.md, padding: S.md, marginBottom: S.lg, borderWidth: 1, borderColor: 'rgba(255,91,0,0.2)' },
  rivalryTxt: { color: C.orange, fontSize: F.xs, fontWeight: '700', letterSpacing: 1 },
  statsGrid: { flexDirection: 'row', gap: S.sm, marginBottom: S.lg },
  statBox: { flex: 1, backgroundColor: C.bgCard, borderRadius: R.lg, padding: S.md, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  statBoxVal: { color: C.text, fontSize: F.md, fontWeight: '900', marginBottom: 3 },
  statBoxLbl: { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1, textAlign: 'center', marginBottom: 2 },
  statBoxSub: { color: C.lime, fontSize: 9, fontWeight: '700', textAlign: 'center' },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: S.base, marginBottom: S.lg },
  formBadges: { flexDirection: 'row', gap: S.sm },
  formBadge: { width: 30, height: 30, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  formTxt: { color: '#fff', fontSize: F.xs, fontWeight: '900' },
  sectionLbl: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2 },
  rosterSection: { marginBottom: S.lg },
  rosterHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: S.base },
  manageBtn: { color: C.orange, fontSize: F.xs, fontWeight: '700', letterSpacing: 1 },
  rosterCard: { backgroundColor: C.bgCard, borderRadius: R.lg, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  rosterRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.base },
  rosterBorder: { borderTopWidth: 1, borderTopColor: C.border },
  rosterAvatar: { width: 44, height: 44, borderRadius: R.full, backgroundColor: C.bgCard2 },
  rosterInfo: { flex: 1 },
  rosterName: { color: C.text, fontSize: F.sm, fontWeight: '800' },
  rosterArch: { color: C.textDim, fontSize: 10, marginTop: 2 },
  rosterStats: { flexDirection: 'row', gap: S.md },
  rosterStat: { alignItems: 'center' },
  rosterStatVal: { color: C.text, fontSize: F.sm, fontWeight: '900' },
  rosterStatLbl: { color: C.textDim, fontSize: 9, fontWeight: '700' },
  streakBanner: { backgroundColor: 'rgba(200,240,0,0.08)', borderRadius: R.md, padding: S.md, marginBottom: S.lg, borderWidth: 1, borderColor: 'rgba(200,240,0,0.2)' },
  streakTxt: { color: C.lime, fontSize: F.xs, fontWeight: '700', letterSpacing: 1 },
  chatPreview: { backgroundColor: C.bgCard, borderRadius: R.lg, padding: S.base, borderWidth: 1, borderColor: C.border, marginBottom: S.lg },
  chatHead: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.md },
  unreadBadge: { backgroundColor: C.orange, borderRadius: R.full, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  unreadTxt: { color: '#fff', fontSize: 10, fontWeight: '900' },
  chatMsg: { flexDirection: 'row', gap: S.sm, marginBottom: S.sm },
  chatAuthor: { color: C.lime, fontSize: F.xs, fontWeight: '800', minWidth: 60 },
  chatTxt: { color: C.textDim, fontSize: F.xs, flex: 1 },
  chatBtn: { backgroundColor: C.lime, borderRadius: R.md, paddingVertical: 12, alignItems: 'center', marginTop: S.sm },
  chatBtnTxt: { color: '#000', fontSize: F.xs, fontWeight: '900', letterSpacing: 1.5 },
  otherSection: {},
  sectionLblTop: { color: C.textDim, fontSize: F.xs, fontWeight: '800', letterSpacing: 2, marginBottom: S.base },
  otherCard: { backgroundColor: C.bgCard, borderRadius: R.lg, padding: S.base, flexDirection: 'row', alignItems: 'center', gap: S.md, marginBottom: S.sm, borderWidth: 1, borderColor: C.border },
  otherLogo: { width: 48, height: 48, borderRadius: R.full, backgroundColor: C.bgCard2 },
  otherInfo: { flex: 1 },
  otherName: { color: C.text, fontSize: F.sm, fontWeight: '800', marginBottom: 3 },
  otherMeta: { color: C.textDim, fontSize: 10, marginBottom: S.sm },
  otherFormRow: { flexDirection: 'row', gap: S.xs },
  otherRight: { alignItems: 'flex-end', gap: 3 },
  otherChem: { color: C.text, fontSize: F.md, fontWeight: '900' },
  otherChemLbl: { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  otherArrow: { color: C.textDim, fontSize: 22, marginTop: 2 },
});
