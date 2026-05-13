import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenContainer } from "@/components/screen-container";
import { AtmosphericLoader } from "@/components/atmospheric-loader";
import { useColors } from "@/hooks/use-colors";
import { useScenario } from "@/lib/scenario-context";
import { trpc } from "@/lib/trpc";
import type { Duration, TimeOfDay, EnergyLevel, Mood, Budget, ScenarioType, SocialMode, ScenarioParams } from "@/shared/types";
import * as Haptics from "expo-haptics";

const STEPS = ["Duration", "Time", "Energy", "Mood", "Budget", "Type", "Social"];
const DURATIONS: { value: Duration; label: string; icon: string }[] = [
  { value: "15-30min", label: "15–30 min", icon: "⚡" },{ value: "30-60min", label: "30–60 min", icon: "🕐" },{ value: "1-2h", label: "1–2 hours", icon: "🕑" },{ value: "2-4h", label: "2–4 hours", icon: "🕒" },{ value: "half-day", label: "Full Day", icon: "🌅" },
];
const TIMES: { value: TimeOfDay; label: string; icon: string }[] = [
  { value: "morning", label: "Morning", icon: "🌅" },{ value: "afternoon", label: "Afternoon", icon: "☀️" },{ value: "evening", label: "Evening", icon: "🌆" },{ value: "night", label: "Night", icon: "🌙" },
];
const ENERGIES: { value: EnergyLevel; label: string; icon: string; desc: string }[] = [
  { value: 1, label: "Very Low", icon: "😴", desc: "Need rest" },{ value: 2, label: "Low", icon: "😌", desc: "Calm pace" },{ value: 3, label: "Normal", icon: "🙂", desc: "Balanced" },{ value: 4, label: "High", icon: "🔥", desc: "Let's go!" },
];
const MOODS: { value: Mood; label: string; icon: string }[] = [
  { value: "recover", label: "Recharge", icon: "💆" },{ value: "cozy", label: "Cozy", icon: "🏠" },{ value: "explore", label: "Explore", icon: "🗺️" },{ value: "calm", label: "Calm", icon: "🧘" },
];
const BUDGETS: { value: Budget; label: string; icon: string; desc: string }[] = [
  { value: "free", label: "Free", icon: "🆓", desc: "0€" },{ value: "cheap", label: "Cheap", icon: "💚", desc: "5–15€" },{ value: "medium", label: "Medium", icon: "💛", desc: "15–40€" },{ value: "comfortable", label: "Premium", icon: "💜", desc: "40€+" },
];
const TYPES: { value: ScenarioType; label: string; icon: string }[] = [
  { value: "walk", label: "Walk", icon: "🚶" },{ value: "food", label: "Food", icon: "🍽️" },{ value: "explore", label: "Explore", icon: "🗺️" },{ value: "culture", label: "Culture", icon: "🎨" },{ value: "activity", label: "Activity", icon: "⚽" },{ value: "rest", label: "Rest", icon: "😌" },
];
const SOCIAL_MODES: { value: SocialMode; label: string; icon: string }[] = [
  { value: "solo", label: "Solo", icon: "🧍" },{ value: "friends", label: "Friends", icon: "👥" },{ value: "partner", label: "Partner", icon: "💑" },{ value: "family", label: "Family", icon: "👨‍👩‍👧" },
];

function SelectCard({ selected, onPress, children, colors }: any) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border, transform: [{ scale: pressed ? 0.98 : selected ? 1.01 : 1 }], opacity: pressed ? 0.9 : 1 }]}>{children}</Pressable>;
}

export default function CreateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, addToHistory, setDailyScenario } = useScenario();
  const [step, setStep] = useState(0);
  const [params, setParams] = useState<Partial<ScenarioParams>>({ city: state.preferences.city, energyLevel: state.preferences.defaultEnergyLevel, budget: state.preferences.defaultBudget, socialMode: state.preferences.defaultSocialMode });
  const [isGenerating, setIsGenerating] = useState(false);
  const generateMutation = trpc.scenario.generate.useMutation();
  const set = <K extends keyof ScenarioParams>(k: K, v: ScenarioParams[K]) => setParams((p) => ({ ...p, [k]: v }));

  const canProceed = useMemo(() => [!!params.duration, !!params.timeOfDay, !!params.energyLevel, !!params.mood, !!params.budget, !!params.scenarioType, !!params.socialMode][step], [params, step]);

  const handleGenerate = async () => { if (!canProceed) return; setIsGenerating(true); try { const scenario = await generateMutation.mutateAsync({ ...params, weather: state.weather ? { temp: state.weather.temp, main: state.weather.main, description: state.weather.description } : undefined } as any); addToHistory(scenario); setDailyScenario(scenario); router.push({ pathname: "/scenario/[id]" as any, params: { id: scenario.id, data: JSON.stringify(scenario) } }); } finally { setIsGenerating(false); } };

  const renderOptions = () => {
    const colorsFor = (s:boolean)=>({color:s?"#FFF":colors.foreground,muted:s?"rgba(255,255,255,0.75)":colors.muted});
    const list = step===0?DURATIONS:step===1?TIMES:step===2?ENERGIES:step===3?MOODS:step===4?BUDGETS:step===5?TYPES:SOCIAL_MODES;
    const key = ["duration","timeOfDay","energyLevel","mood","budget","scenarioType","socialMode"][step] as keyof ScenarioParams;
    return <View style={styles.grid}>{list.map((item:any)=>{const selected=params[key]===item.value; const c=colorsFor(selected); return <SelectCard key={String(item.value)} selected={selected} colors={colors} onPress={()=>{if(Platform.OS!=="web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); set(key,item.value as any);}}><Text style={styles.icon}>{item.icon}</Text><Text style={[styles.title,{color:c.color}]}>{item.label}</Text>{item.desc?<Text style={[styles.desc,{color:c.muted}]}>{item.desc}</Text>:null}</SelectCard>;})}</View>;
  };

  return <ScreenContainer containerClassName="bg-background"><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":undefined}><ScrollView style={styles.scroll} contentContainerStyle={[styles.content,{paddingBottom:120+insets.bottom}]}>{!isGenerating && <View style={styles.progress}><Text style={[styles.stepMeta,{color:colors.primary}]}>Step {step+1} of {STEPS.length}</Text><Text style={[styles.stepLabel,{color:colors.foreground}]}>{STEPS[step]}</Text><View style={[styles.bar,{backgroundColor:colors.border}]}><View style={[styles.fill,{backgroundColor:colors.primary,width:`${((step+1)/STEPS.length)*100}%`}]} /></View></View>}{isGenerating?<AtmosphericLoader/>:renderOptions()}</ScrollView>{!isGenerating && <View style={[styles.footer,{paddingBottom:Math.max(insets.bottom,12),backgroundColor:colors.background,borderTopColor:colors.border}]}><Pressable style={[styles.btn,{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1}]} disabled={step===0} onPress={()=>setStep((s)=>Math.max(0,s-1))}><Text style={[styles.btnText,{color:step===0?colors.muted:colors.foreground}]}>Back</Text></Pressable><Pressable style={[styles.btn,{backgroundColor:canProceed?colors.primary:colors.surface}]} disabled={!canProceed} onPress={()=>step<STEPS.length-1?setStep((s)=>s+1):handleGenerate()}><Text style={[styles.btnText,{color:canProceed?"#fff":colors.muted}]}>{step===STEPS.length-1?"Generate":"Next"}</Text></Pressable></View>}</KeyboardAvoidingView></ScreenContainer>;
}

const styles=StyleSheet.create({scroll:{flex:1},content:{padding:16,gap:18},progress:{gap:6},stepMeta:{fontSize:13,fontWeight:"700"},stepLabel:{fontSize:28,fontWeight:"800"},bar:{height:6,borderRadius:999,overflow:"hidden"},fill:{height:"100%"},grid:{gap:10},card:{padding:14,borderRadius:14,borderWidth:1,gap:6},icon:{fontSize:22},title:{fontSize:16,fontWeight:"700"},desc:{fontSize:12,fontWeight:"500"},footer:{position:"absolute",bottom:0,left:0,right:0,flexDirection:"row",gap:12,paddingHorizontal:16,paddingTop:10,borderTopWidth:1},btn:{flex:1,paddingVertical:14,borderRadius:12,alignItems:"center"},btnText:{fontSize:15,fontWeight:"700"}});
