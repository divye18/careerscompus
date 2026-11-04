const fs = require('fs');
let code = fs.readFileSync('src/components/home/CareerCompassSystem.tsx', 'utf8');
if (!code.includes('MotionValue')) {
  code = code.replace(/import \* as THREE from 'three';/, \import * as THREE from 'three';\\nimport { MotionValue } from 'framer-motion';\);
}
code = code.replace(/globalProgress: number;/g, 'globalProgress: MotionValue<number>;');
code = code.replace(/useFrame\(\(state, delta\) => \{/, \useFrame((state, delta) => {\\n    const progressVal = Math.max(0, Math.min(1, globalProgress.get()));\);
code = code.replace(/const progress = globalProgress;/g, 'const progress = progressVal;');
code = code.replace(/globalProgress /g, 'progressVal ');
fs.writeFileSync('src/components/home/CareerCompassSystem.tsx', code);

