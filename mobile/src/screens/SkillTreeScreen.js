import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Animated as RNAnimated, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Ionicons, FontAwesome5, AntDesign, MaterialCommunityIcons, FontAwesome, Fontisto } from '@expo/vector-icons';


// ── DATA ─────────────────────────────────────────────────────
const BRANCHES = [
  {
    id: 'core', name: 'LOGICA', subtitle: 'Arquitectura y Lógica',
    color: '#1eff00ff', glow: 'rgba(58, 227, 18, 0.3)', points: 247,
    nodes: [
      { id: 'ch', x: 90, y: 648, r: 22, Icon: ({ size, color }) => <FontAwesome5 name="brain" size={size} color={color} />, name: 'Core', status: 'active', prog: null, util: ['Constituye el eje central de la lógica del sistema y la base de cualquier software, permitiendo diseñar soluciones escalables desde la raíz.'] },
      { id: 'ca', x: 42, y: 535, r: 17, Icon: ({ size, color }) => <FontAwesome name="sitemap" size={size} color={color} />, name: 'Algoritmos', status: 'completed', prog: '5/5', util: ['Permite optimizar las búsquedas y reducir tiempos de procesamiento en la app, además de ser clave para superar con éxito entrevistas técnicas.'] },
      { id: 'cs', x: 148, y: 535, r: 17, Icon: ({ size, color }) => <MaterialCommunityIcons name="pillar" size={size} color={color} />, name: 'SOLID', status: 'completed', prog: '5/5', util: ['Facilita el diseño de clases reutilizables y el testing unitario, garantizando una estructura robusta que previene bugs durante futuras refactorizaciones.'] },
      { id: 'cd', x: 12, y: 422, r: 14, Icon: ({ size, color }) => <MaterialCommunityIcons name="file-tree" size={size} color={color} />, name: 'Estructuras', status: 'in_progress', prog: '3/5', util: ['Fundamental para implementar cachés, colas y optimizar el almacenamiento mediante la resolución eficiente de problemas con árboles y grafos.'] },
      { id: 'cc', x: 80, y: 418, r: 14, Icon: ({ size, color }) => <MaterialCommunityIcons name="broom" size={size} color={color} />, name: 'Clean Code', status: 'in_progress', prog: '2/5', util: ['Asegura que el código sea legible para todo el equipo, minimizando errores al realizar cambios y agilizando el onboarding de nuevos desarrolladores.'] },
      { id: 'cdp', x: 162, y: 422, r: 14, Icon: ({ size, color }) => <MaterialCommunityIcons name="shape-outline" size={size} color={color} />, name: 'Patrones', status: 'available', prog: '0/5', util: ['Ayuda a resolver problemas recurrentes de forma ágil y a construir módulos extensibles utilizando un lenguaje técnico estandarizado con otros ingenieros.'] },
      { id: 'car', x: 35, y: 308, r: 13, Icon: ({ size, color }) => <MaterialCommunityIcons name="office-building-outline" size={size} color={color} />, name: 'Arquitectura', status: 'locked', prog: '0/5', util: ['Capacita para diseñar microservicios y separar responsabilidades en capas, permitiendo escalar aplicaciones complejas sin necesidad de reescribir el código.'] },
      { id: 'cr', x: 150, y: 304, r: 12, Icon: ({ size, color }) => <Ionicons name="refresh-circle-outline" size={size} color={color} />, name: 'Recursión', status: 'locked', prog: '0/5', util: ['Esencial para implementar algoritmos de búsqueda en árboles, parsear estructuras de datos anidadas y resolver problemas complejos mediante backtracking.'] },
      { id: 'cx', x: 88, y: 192, r: 13, Icon: ({ size, color }) => <AntDesign name="linechart" size={size} color={color} />, name: 'Complejidad', status: 'locked', prog: '0/5', util: ['Proporciona las herramientas para identificar cuellos de botella y comparar soluciones objetivamente, permitiendo justificar decisiones técnicas con datos.'] },
    ],
    connections: [['ch', 'ca'], ['ch', 'cs'], ['ca', 'cd'], ['ca', 'cc'], ['cs', 'cdp'], ['cd', 'car'], ['cc', 'car'], ['cdp', 'cr'], ['car', 'cx'], ['cr', 'cx']],
  },
  {
    id: 'arsenal', name: 'HERRAMIENTAS', subtitle: 'Maestría Técnica y Herramientas',
    color: '#ff0000ff', glow: 'rgba(255, 0, 0, 0.3)', points: 183,
    nodes: [
      { id: 'ah', x: 312, y: 648, r: 22, Icon: ({ size, color }) => <Ionicons name="terminal" size={size} color={color} />, name: 'Arsenal', status: 'active', prog: null, util: ['Establece la base del stack tecnológico, permitiendo el dominio integral de frontend y backend para conectar todos los módulos del sistema de forma cohesiva.'] },
      { id: 'aj', x: 265, y: 535, r: 17, Icon: ({ size, color }) => <Ionicons name="logo-javascript" size={size} color={color} />, name: 'JavaScript', status: 'completed', prog: '5/5', util: ['Motor principal para desarrollar la lógica de la aplicación en React Native, crear servidores en Node.js y automatizar flujos de trabajo mediante scripts.'] },
      { id: 'ano', x: 359, y: 535, r: 17, Icon: ({ size, color }) => <FontAwesome5 name="node-js" size={size} color={color} />, name: 'Node.js', status: 'in_progress', prog: '3/5', util: ['Entorno fundamental para construir las APIs del proyecto, gestionar las peticiones del frontend y orquestar la comunicación con MongoDB y servicios de IA.'] },
      { id: 'at', x: 240, y: 422, r: 14, Icon: ({ size, color }) => <MaterialCommunityIcons name="language-typescript" size={size} color={color} />, name: 'TypeScript', status: 'in_progress', prog: '2/5', util: ['Añade una capa de tipado que detecta errores en tiempo de desarrollo y mejora el mantenimiento del código en equipo gracias al autocompletado inteligente.'] },
      { id: 'arn', x: 312, y: 418, r: 14, Icon: ({ size, color }) => <FontAwesome5 name="react" size={size} color={color} />, name: 'React Native', status: 'available', prog: '0/5', util: ['Permite construir interfaces nativas de alto rendimiento para iOS y Android con un solo código base, utilizando componentes altamente reutilizables.'] },
      { id: 'adb', x: 384, y: 422, r: 14, Icon: ({ size, color }) => <Fontisto name="mongodb" size={size} color={color} />, name: 'MongoDB', status: 'in_progress', prog: '1/5', util: ['Domina el modelado de datos no relacionales mediante documentos flexibles, permitiendo gestionar grandes volúmenes de información con esquemas dinámicos y escalabilidad horizontal eficiente.'] },
      { id: 'aap', x: 268, y: 308, r: 13, Icon: ({ size, color }) => <MaterialCommunityIcons name="api" size={size} color={color} />, name: 'APIs REST', status: 'locked', prog: '0/5', util: ['Facilita el intercambio de datos entre el cliente y el servidor, integrando servicios externos y estableciendo contratos claros de comunicación técnica.'] },
      { id: 'ate', x: 356, y: 304, r: 12, Icon: ({ size, color }) => <MaterialCommunityIcons name="test-tube" size={size} color={color} />, name: 'Testing', status: 'locked', prog: '0/5', util: ['Garantiza la estabilidad de los endpoints y previene regresiones en producción, permitiendo evolucionar el software con total confianza y seguridad.'] },
      { id: 'aai', x: 312, y: 190, r: 15, Icon: ({ size, color }) => <MaterialCommunityIcons name="robot-outline" size={size} color={color} />, name: 'IA / LLMs', status: 'locked', prog: '0/5', util: ['Especializado en la integración de modelos como GPT o DeepSeek para construir tutores inteligentes y automatizar el análisis avanzado de código.'] },
    ],
    connections: [['ah', 'aj'], ['ah', 'ano'], ['aj', 'at'], ['aj', 'arn'], ['ano', 'adb'], ['ano', 'arn'], ['at', 'aap'], ['arn', 'aap'], ['adb', 'ate'], ['aap', 'aai'], ['ate', 'aai']],
  },
  {
    id: 'estrategia', name: 'LA ESTRATEGIA', subtitle: 'Metodología y Colaboración',
    color: '#eeff00ff', glow: 'rgba(255, 255, 62, 0.3)', points: 121,
    nodes: [
      { id: 'eh', x: 534, y: 648, r: 22, Icon: ({ size, color }) => <FontAwesome5 name="chess-knight" size={size} color={color} />, name: 'Estrategia', status: 'active', prog: null, util: ['Define el marco de trabajo para colaborar efectivamente en equipo, garantizando la entrega de software de alta calidad mediante procesos profesionales adaptables.'] },
      { id: 'eg', x: 476, y: 535, r: 17, Icon: ({ size, color }) => <AntDesign name="github" size={size} color={color} />, name: 'Git/GitHub', status: 'completed', prog: '5/5', util: ['Permite gestionar el historial de cambios y trabajar en ramas sin conflictos, facilitando la colaboración mediante Pull Requests y la recuperación ante errores.'] },
      { id: 'ea', x: 592, y: 535, r: 17, Icon: ({ size, color }) => <FontAwesome5 name="hands-helping" size={size} color={color} />, name: 'Agile', status: 'in_progress', prog: '2/5', util: ['Metodología para planificar sprints de forma eficiente y estimar tiempos realistas, permitiendo al equipo adaptarse rápidamente a cambios en los requisitos.'] },
      { id: 'er', x: 452, y: 422, r: 14, Icon: ({ size, color }) => <MaterialCommunityIcons name="eye-check-outline" size={size} color={color} />, name: 'Code Review', status: 'in_progress', prog: '3/5', util: ['Fomenta la mejora continua del código y el aprendizaje colectivo, ayudando a detectar bugs y asegurar estándares técnicos antes de llegar a producción.'] },
      { id: 'esc', x: 534, y: 418, r: 14, Icon: ({ size, color }) => <MaterialCommunityIcons name="clipboard-list-outline" size={size} color={color} />, name: 'Scrum', status: 'available', prog: '0/5', util: ['Facilita el liderazgo de daily standups y la gestión del backlog, asegurando que cada ciclo de trabajo entregue valor tangible al producto final.'] },
      { id: 'edo', x: 608, y: 422, r: 12, Icon: ({ size, color }) => <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />, name: 'Docs', status: 'available', prog: '0/5', util: ['Fundamental para crear READMEs claros y documentar APIs, asegurando que el código sea comprensible para el equipo y facilite la integración con el frontend.'] },
      { id: 'eci', x: 470, y: 308, r: 13, Icon: ({ size, color }) => <MaterialCommunityIcons name="rocket-launch-outline" size={size} color={color} />, name: 'CI/CD', status: 'locked', prog: '0/5', util: ['Automatiza el ciclo de integración y despliegue para realizar entregas sin estrés, ejecutando tests automáticos en cada PR para detectar fallos prematuros.'] },
      { id: 'ep', x: 594, y: 304, r: 12, Icon: ({ size, color }) => <MaterialCommunityIcons name="account-multiple-outline" size={size} color={color} />, name: 'Pair Prog.', status: 'locked', prog: '0/5', util: ['Técnica de desarrollo colaborativo que permite resolver problemas complejos en conjunto, acelerando el aprendizaje y elevando la calidad técnica del equipo.'] },
      { id: 'edv', x: 534, y: 190, r: 14, Icon: ({ size, color }) => <MaterialCommunityIcons name="cloud-upload-outline" size={size} color={color} />, name: 'DevOps', status: 'locked', prog: '0/5', util: ['Capacita para desplegar aplicaciones en nubes como Azure o AWS utilizando Docker, permitiendo configurar y monitorear servidores en entornos de producción.'] },
    ],
    connections: [['eh', 'eg'], ['eh', 'ea'], ['eg', 'er'], ['ea', 'esc'], ['ea', 'edo'], ['er', 'eci'], ['esc', 'eci'], ['edo', 'ep'], ['eci', 'edv'], ['ep', 'edv']],
  },
];

const TRUNK = [
  [312, 700, 90, 660], [312, 700, 312, 660], [312, 700, 534, 660],
];

const bezier = (x1, y1, x2, y2) => {
  const my = (y1 + y2) / 2;
  return `M${x1} ${y1} C${x1} ${my},${x2} ${my},${x2} ${y2}`;
};

const STATUS = {
  completed: { opacity: 1.0, glow: true },
  active: { opacity: 1.0, glow: true },
  in_progress: { opacity: 0.85, glow: false },
  available: { opacity: 0.5, glow: false },
  locked: { opacity: 1.0, glow: false },
};

// ── NODE (Reanimated 3) ────────────────────────────────────────
// node.Icon: optional component → ({ size, color }) => JSX, else emoji fallback.
// Locked: icon dimmed at 0.3 opacity — no lock icon.
const Node = ({ node, branch, sx, delay, onPress }) => {
  const locked = node.status === 'locked';
  const alive = node.status === 'active' || node.status === 'in_progress';
  const sz = node.r * 2;
  const iconColor = locked ? '#2A4060' : branch.color;

  const sc = useRef(new RNAnimated.Value(0)).current;  // entrance + press
  const br = useRef(new RNAnimated.Value(1)).current;  // idle breathing glow

  useEffect(() => {
    // Entrance animation
    RNAnimated.sequence([
      RNAnimated.delay(delay),
      RNAnimated.spring(sc, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true })
    ]).start();

    // Breathing pulse
    if (alive) {
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(br, { toValue: 1.35, duration: 1800, useNativeDriver: true }),
          RNAnimated.timing(br, { toValue: 1.0, duration: 1800, useNativeDriver: true })
        ])
      ).start();
    }
  }, []);

  const pressIn = () => !locked && RNAnimated.spring(sc, { toValue: 0.85, friction: 6, tension: 80, useNativeDriver: true }).start();
  const pressOut = () => !locked && RNAnimated.spring(sc, { toValue: 1.0, friction: 5, tension: 60, useNativeDriver: true }).start();

  return (
    <RNAnimated.View style={[{
      position: 'absolute',
      left: sx(node.x) - node.r, top: node.y - node.r,
      width: sz, height: sz,
      transform: [{ scale: sc }]
    }]}>

      {/* Animated Soft Glow Background */}
      {alive && (
        <RNAnimated.View style={[StyleSheet.absoluteFill, {
          borderRadius: node.r,
          backgroundColor: branch.color,
          transform: [{ scale: br }],
          opacity: br.interpolate({ inputRange: [1.0, 1.35], outputRange: [0.35, 0] })
        }]} />
      )}

      {/* Main Static Node */}
      <TouchableOpacity
        style={[styles.node, {
          width: '100%', height: '100%', borderRadius: node.r,
          borderColor: locked ? '#152535' : branch.color,
          backgroundColor: locked ? '#080F1A' : `${branch.color}18`,
          borderWidth: node.status === 'completed' ? 2.5 : 1.5,
          opacity: STATUS[node.status].opacity,
        }]}
        onPress={(e) => !locked && onPress(node, branch, e)}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
      >
        {node.Icon
          ? <node.Icon size={node.r * 1.3} color={iconColor} style={{ opacity: locked ? 0.3 : 1 }} />
          : <Text style={{ fontSize: node.r * 0.85, opacity: locked ? 0.3 : 1 }}>{node.icon || '?'}</Text>
        }
      </TouchableOpacity>
    </RNAnimated.View>
  );
};

// ── MAIN ─────────────────────────────────────────────────────
export default function SkillTreeScreen() {
  const { width: W, height: H } = useWindowDimensions();
  const CH = 720;
  const CW = W * 3;  // 3 pages: [Core], [Arsenal], [Estrategia]

  // Maps original X (centers: ~90, 312, ~534) to centers of the 3 pages: 0.5W, 1.5W, 2.5W
  const sx = x => ((x - 312) * (W / 224)) + (W * 1.5);

  const hScrollRef = useRef(null);

  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const [origin, setOrigin] = useState({ x: W / 2, y: H / 2 });
  const modalAnim = useRef(new RNAnimated.Value(0)).current;

  const openModal = (node, branch, event) => {
    if (event && event.nativeEvent) {
      setOrigin({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    } else {
      setOrigin({ x: W / 2, y: H / 2 });
    }
    setSelected({ node, branch });
    modalAnim.setValue(0);
    RNAnimated.spring(modalAnim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    RNAnimated.timing(modalAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setSelected(null));
  };

  const totalXP = BRANCHES.reduce((s, b) => s + b.points, 0);

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#060E1C" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ÁRBOL DE HABILIDADES</Text>
        <View style={styles.xpBadge}><Text style={styles.xpText}>⭐ {totalXP} XP</Text></View>
      </View>

      {/* Branch labels (Tabs) */}
      <View style={styles.labels}>
        {BRANCHES.map((b, i) => (
          <TouchableOpacity
            key={b.id}
            style={styles.labelItem}
            activeOpacity={0.7}
            onPress={() => hScrollRef.current?.scrollTo({ x: i * W, animated: true })}
          >
            <View style={[styles.dot, { backgroundColor: b.color }]} />
            <Text style={[styles.labelName, { color: b.color }]}>{b.name}</Text>
            <Text style={styles.labelPts}>{b.points} XP</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Canvas */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          ref={hScrollRef}
          contentOffset={{ x: W, y: 0 }}
        >
          {BRANCHES.map((b, i) => (
            <View key={b.id} style={{ width: W, height: CH, zIndex: 10 }}>

              {/* The continuous SVG background lives in Page 1 and bleeds across */}
              {i === 0 && (
                <View style={{ position: 'absolute', top: 0, left: 0, width: CW, height: CH }} pointerEvents="none">
                  <Svg style={StyleSheet.absoluteFill} width={CW} height={CH} overflow="visible">
                    <Defs>
                      {BRANCHES.map(branch => (
                        <RadialGradient key={branch.id} id={`g${branch.id}`} cx="50%" cy="50%" r="50%">
                          <Stop offset="0%" stopColor={branch.color} stopOpacity="0.8" />
                          <Stop offset="100%" stopColor={branch.color} stopOpacity="0" />
                        </RadialGradient>
                      ))}
                    </Defs>

                    {/* Trunk */}
                    {TRUNK.map(([x1, y1, x2, y2], idx) => (
                      <Path key={idx} d={bezier(sx(x1), y1, sx(x2), y2)} stroke="#1A3055" strokeWidth={2.5} strokeLinecap="round" fill="none" />
                    ))}

                    {/* Branch connections */}
                    {BRANCHES.flatMap(branch =>
                      branch.connections.map(([fid, tid], idx) => {
                        const f = branch.nodes.find(n => n.id === fid);
                        const t = branch.nodes.find(n => n.id === tid);
                        if (!f || !t) return null;
                        const active = t.status !== 'locked';
                        return (
                          <Path key={`${branch.id}${idx}`}
                            d={bezier(sx(f.x), f.y, sx(t.x), t.y)}
                            stroke={active ? branch.color : '#152030'}
                            strokeWidth={active ? 2.5 : 1.5}
                            strokeOpacity={active ? 0.65 : 0.35}
                            fill="none" strokeLinecap="round"
                          />
                        );
                      })
                    )}

                    {/* Hub glows */}
                    {BRANCHES.map(branch => {
                      const h = branch.nodes[0];
                      return <Circle key={branch.id} cx={sx(h.x)} cy={h.y} r={h.r + 20} fill={branch.glow} />;
                    })}

                    {/* Root dot */}
                    <Circle cx={sx(312)} cy={700} r={8} fill="#0F2035" />
                    <Circle cx={sx(312)} cy={700} r={4} fill="#3A7ABF" />
                  </Svg>
                </View>
              )}

              {/* Interactive Nodes for THIS page */}
              {b.nodes.map(n => (
                <Node key={n.id} node={n} branch={b} sx={(x) => sx(x) - (i * W)}
                  delay={Math.max(0, Math.round((680 - n.y) / 4))}
                  onPress={openModal} />
              ))}

              {/* Progress labels for THIS page */}
              {b.nodes.filter(n => n.prog).map(n => (
                <Text key={`l${n.id}`} style={[styles.progLabel, {
                  left: sx(n.x) - (i * W) - 20, top: n.y + n.r + 2, color: n.status === 'locked' ? '#254060' : b.color,
                }]}>{n.prog}</Text>
              ))}

            </View>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Modal */}
      {selected && (
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeModal}>
          <RNAnimated.View style={[styles.card, {
            borderColor: selected.branch.color,
            opacity: modalAnim,
            transform: [
              { translateX: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [origin.x - W / 2, 0] }) },
              { translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [origin.y - H / 2, 0] }) },
              { scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.05, 1] }) },
            ],
          }]}>
            <TouchableOpacity activeOpacity={1} onPress={() => { }}>

              {/* Glow top accent */}
              <View style={[styles.cardAccent, { backgroundColor: selected.branch.color }]} />

              {/* Icon — custom SVG component or emoji fallback */}
              <View style={styles.cardIconWrap}>
                {selected.node.Icon
                  ? <selected.node.Icon size={48} color={selected.branch.color} />
                  : <Text style={styles.cardIcon}>{selected.node.icon}</Text>
                }
              </View>
              <Text style={[styles.cardName, { color: selected.branch.color }]}>{selected.node.name}</Text>
              <Text style={styles.cardSub}>{selected.branch.subtitle}</Text>

              {/* Status */}
              <View style={[styles.pill, { borderColor: selected.branch.color }]}>
                <Text style={[styles.pillText, { color: selected.branch.color }]}>
                  {selected.node.status === 'completed' && ' Completado'}
                  {selected.node.status === 'active' && ' Activo'}
                  {selected.node.status === 'in_progress' && ` En progreso — ${selected.node.prog}`}
                  {selected.node.status === 'available' && ' Disponible para estudiar'}
                </Text>
              </View>

              {/* Progress bar */}
              {selected.node.prog && (
                <View style={styles.bar}>
                  <View style={[styles.barFill, {
                    backgroundColor: selected.branch.color,
                    width: `${(parseInt(selected.node.prog) / 5) * 100}%`,
                  }]} />
                </View>
              )}

              {/* Utilities */}
              <Text style={styles.utTitle}> ¿Qué puedes hacer con esto?</Text>
              {selected.node.util.map((u, i) => (
                <View key={i} style={styles.utRow}>
                  <View style={[styles.utDot, { backgroundColor: selected.branch.color }]} />
                  <Text style={styles.utText}>{u}</Text>
                </View>
              ))}

              <TouchableOpacity style={[styles.btn, { borderColor: selected.branch.color, backgroundColor: `${selected.branch.color}15` }]} onPress={closeModal}>
                <Text style={[styles.btnText, { color: selected.branch.color }]}>Ir a ejercicios →</Text>
              </TouchableOpacity>

            </TouchableOpacity>
          </RNAnimated.View>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── STYLES ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060E1C' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#0C1E35' },
  title: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 2.5 },
  xpBadge: { backgroundColor: '#0C1E35', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  xpText: { color: '#FFD54F', fontSize: 13, fontWeight: '700' },
  labels: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#0C1E35' },
  labelItem: { alignItems: 'center', gap: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  labelName: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  labelPts: { fontSize: 9, color: '#3A5A7A' },
  node: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', borderWidth: 1.5 },
  progLabel: { position: 'absolute', fontSize: 9, fontWeight: '700', letterSpacing: 0.5, width: 40, textAlign: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', backgroundColor: '#080F1E', borderRadius: 22, borderWidth: 1.5, overflow: 'hidden' },
  cardAccent: { height: 4, width: '100%', opacity: 0.7 },
  cardIconWrap: { alignItems: 'center', marginTop: 20, marginBottom: 4 },
  cardIcon: { fontSize: 44, textAlign: 'center', marginTop: 20, marginBottom: 4 },
  cardName: { fontSize: 22, fontWeight: '800', textAlign: 'center', letterSpacing: 1 },
  cardSub: { fontSize: 12, color: '#3A5A7A', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 },
  pill: { alignSelf: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 5, marginBottom: 10 },
  pillText: { fontSize: 12, fontWeight: '700' },
  bar: { height: 5, backgroundColor: '#0C1E35', borderRadius: 3, marginHorizontal: 24, marginBottom: 16, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  utTitle: { fontSize: 13, fontWeight: '700', color: '#7A9AB8', marginHorizontal: 24, marginBottom: 10, letterSpacing: 0.5 },
  utRow: { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 24, marginBottom: 8, gap: 10 },
  utDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5, flexShrink: 0 },
  utText: { fontSize: 13, color: '#C8D8E8', lineHeight: 20, flex: 1 },
  btn: { margin: 20, marginTop: 14, borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
});
