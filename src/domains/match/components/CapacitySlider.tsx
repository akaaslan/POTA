import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, F, S } from '../../../theme';

var THUMB_D = 22;

export function CapacitySlider({ value, min, max, onChange }) {
  var trackWRef = useRef(1);
  var [trackW, setTrackW] = useState(1);

  var pct     = max > min ? (value - min) / (max - min) : 0;
  var thumbPx = Math.max(0, pct * (trackW - THUMB_D));

  function calcAndEmit(locationX) {
    var w = trackWRef.current;
    if (w <= THUMB_D) return;
    var p   = Math.max(0, Math.min(1, locationX / w));
    var val = Math.round(min + p * (max - min));
    onChange(val);
  }

  function onLayout(e) {
    var w = e.nativeEvent.layout.width;
    trackWRef.current = w;
    setTrackW(w);
  }

  return (
    <View style={sl.root}>
      <View
        style={sl.hitArea}
        onLayout={onLayout}
        onStartShouldSetResponder={function() { return true; }}
        onMoveShouldSetResponder={function() { return true; }}
        onResponderGrant={function(e) { calcAndEmit(e.nativeEvent.locationX); }}
        onResponderMove={function(e) { calcAndEmit(e.nativeEvent.locationX); }}
      >
        <View style={sl.track} pointerEvents="none">
          <View style={[sl.fill, { width: thumbPx + THUMB_D / 2 }]} />
        </View>
        <View
          pointerEvents="none"
          style={[sl.thumb, { left: thumbPx, top: (44 - THUMB_D) / 2 }]}
        />
      </View>
      <View style={sl.labels}>
        <Text style={sl.labelTxt}>{min}</Text>
        <Text style={sl.labelTxt}>{max}</Text>
      </View>
    </View>
  );
}

var sl = StyleSheet.create({
  root:    { marginTop: S.sm },
  hitArea: { height: 44 },
  track: {
    position: 'absolute',
    top: (44 - 4) / 2,
    left: 0, right: 0,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: C.lime,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_D, height: THUMB_D,
    borderRadius: THUMB_D / 2,
    backgroundColor: C.lime,
    elevation: 6,
    shadowColor: C.lime,
    shadowOpacity: 0.55,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: S.xs,
  },
  labelTxt: { color: C.textDim, fontSize: F.xs, fontWeight: '700' },
});
