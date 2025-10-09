import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function Sphere3D({ chatEnabled, sphereState, isListening, voiceText, isVoiceActive, onGradientUpdate, onMoveComplete, onShowAlgorithm, onHideResponse }) {
  const moveUpTimerRef = useRef(null);
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      lightDir: { value: new THREE.Vector3(0.2, 0.9, 0.3).normalize() },
      ringDir: { value: new THREE.Vector3(0, 1, 0).normalize() },
      camY: { value: 0.0 },
      moveState: { value: 0.0 },
      clearState: { value: 0.0 },
      opacity: { value: 0.0 },
      voiceActive: { value: 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float time;
      uniform vec3 lightDir;
      uniform vec3 ringDir;
      uniform float moveState;
      uniform float clearState;
      uniform float opacity;
      uniform float voiceActive;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      float hash(vec2 p) { 
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345);
        return fract(p.x * p.y);
      }
      
      float noise(vec2 p) {
        return sin(p.x) * cos(p.y) + sin(p.x * 2.0) * cos(p.y * 2.0) * 0.5;
      }
      
      void main() {
        vec3 N = normalize(vNormal);
        vec3 L = normalize(lightDir);
        vec2 p = vUv - 0.5;
        float r = length(p);

        // 호흡 효과
        float breathing = sin(time * 0.5) * 0.03;
        r = r * (1.0 + breathing);

        // 상단 방향성 (로컬 Y축 기준)
        float baseTopness = vPosition.y * 0.5 + 0.5; // 로컬 Y 위치를 0~1 범위로 변환
        baseTopness = clamp(baseTopness, 0.0, 1.0);
        
        // moveState에 따른 부드러운 그라데이션 전환
        float transitionPhase = smoothstep(0.0, 1.0, moveState);
        float waveEffect = sin(baseTopness * 6.28318 + time * 2.0) * 0.1 * (1.0 - transitionPhase);
        float topness = mix(
          baseTopness + waveEffect,
          1.0 - baseTopness,
          smoothstep(0.0, 1.0, transitionPhase)
        );

        // 색상 정의 (차트에서 가져온 정확한 색상)
        vec3 color0 = vec3(0.051, 0.008, 0.118);    // #0D021E (0%)
        vec3 color1 = vec3(0.153, 0.039, 0.188);    // #270A30 (11%)
        vec3 color2 = vec3(0.733, 0.047, 0.400);    // #BB0C66 (29%)
        vec3 color3 = vec3(0.957, 0.635, 0.745);    // #F4A2BE (59%)
        vec3 color4 = vec3(0.965, 0.533, 0.643);    // #F688A4 (82%)
        vec3 color5 = vec3(0.969, 0.510, 0.620);    // #F7829E (90%)
        vec3 color6 = vec3(1.000, 1.000, 1.000);    // #FFFFFF (95%)
        vec3 color7 = vec3(0.906, 0.784, 1.000);    // #E7C8FF (100%)

        // 그라데이션 믹싱 (정확한 위치에서 보간)
        vec3 baseColor;
        if (topness < 0.11) {
          baseColor = mix(color0, color1, smoothstep(0.0, 0.11, topness));
        } else if (topness < 0.29) {
          baseColor = mix(color1, color2, smoothstep(0.11, 0.29, topness));
        } else if (topness < 0.59) {
          baseColor = mix(color2, color3, smoothstep(0.29, 0.59, topness));
        } else if (topness < 0.82) {
          baseColor = mix(color3, color4, smoothstep(0.59, 0.82, topness));
        } else if (topness < 0.90) {
          baseColor = mix(color4, color5, smoothstep(0.82, 0.90, topness));
        } else if (topness < 0.95) {
          baseColor = mix(color5, color6, smoothstep(0.90, 0.95, topness));
        } else {
          baseColor = mix(color6, color7, smoothstep(0.95, 1.0, topness));
        }

        // 물결 효과 (매우 부드럽게)
        float ripple1 = noise(vUv * 2.0 + time * 0.3) * 0.015;
        float ripple2 = noise(vUv * 3.0 + time * 0.2) * 0.01;
        float totalRipple = ripple1 + ripple2;
        baseColor += baseColor * totalRipple * 0.8; // 현재 색상 기반으로 약한 물결 효과

        // 조명 효과 (더 부드럽게)
        float diffuse = max(dot(N, L), 0.0);
        baseColor *= 0.95 + diffuse * 0.15;

        // 프레넬 효과 (더 미묘하게)
        vec3 V = vec3(0.0, 0.0, 1.0);
        float fresnel = pow(1.0 - max(dot(N, V), 0.0), 4.0);
        vec3 fresnelColor = mix(baseColor, vec3(1.0), 0.5); // 현재 색상 기반 프레넬
        baseColor += fresnelColor * fresnel * 0.2;

        // Clear 상태일 때 글로우
        if (clearState > 0.5) {
          float glowPulse = 0.4 + sin(time * 1.5) * 0.2;
          vec3 glowColor = vec3(1.0, 0.95, 0.98);
          baseColor = mix(baseColor, glowColor, 0.2 * glowPulse);
        }

        // 음성 입력 시 밝아지는 효과
        if (voiceActive > 0.0) {
          float voicePulse = 0.3 + sin(time * 3.0) * 0.1; // 빠른 펄스
          vec3 voiceGlow = vec3(1.0, 0.98, 0.95);
          baseColor = mix(baseColor, voiceGlow, voiceActive * voicePulse);
          baseColor *= 1.0 + voiceActive * 0.3; // 전체적인 밝기 증가
        }

        // 감마 보정 및 밝기 조정
        baseColor = pow(baseColor, vec3(0.9));
        baseColor *= 1.1;
        baseColor = clamp(baseColor, 0.0, 1.0);

        // 가장자리 페이드아웃
        float edge = smoothstep(0.5, 0.35, r);
        float alpha = edge * opacity;

        gl_FragColor = vec4(baseColor, alpha);
      }
    `,
    transparent: true,
  }), [])

  // 스프링 상태 저장
  const velocityRef = useRef(0)

  useFrame((state, delta) => {
    // 시간 업데이트
    material.uniforms.time.value += delta

    // 상태에 따른 유니폼 업데이트
    material.uniforms.clearState.value = sphereState === 'clear' ? 1.0 : 0.0
    material.uniforms.moveState.value = sphereState === 'move-up' ? 1.0 : 0.0
    material.uniforms.voiceActive.value = isVoiceActive ? 1.0 : 0.0

      if (meshRef.current && chatEnabled) {
        const time = state.clock.getElapsedTime();

        // 초기 등장 애니메이션 (버튼과 함께)
        if (!voiceText) {
          const delay = 1.5; // 버튼과 동일한 딜레이
          if (time > delay) {
            const animationTime = time - delay;
            const duration = 2.5; // 더 긴 애니메이션 지속 시간
            const progress = Math.min(animationTime / duration, 1.0);
            
            // 매우 부드러운 이징 함수 적용
            const eased = 1 - Math.pow(1 - progress, 4); // quartic ease-out
            
            // 위치와 오퍼시티 동시에 업데이트
            const targetY = -0.8;
            const startY = -6;
            const currentY = startY + (targetY - startY) * eased;
            meshRef.current.position.y = currentY;
            
            // 극도로 느린 웨이브 효과
            const waveSpeed = 0.02; // 매우 천천히 (약 314초 주기)
            const waveAmplitude = 0.005; // 매우 작은 진폭
            const wavePhase = Math.sin(time * waveSpeed) * waveAmplitude;
            
            // 더 느린 보조 웨이브
            const microWave = Math.sin(time * 0.008) * 0.003; // 약 785초 주기
            
            // 오퍼시티 업데이트 (더 강한 블러 효과)
            const opacityProgress = (currentY - startY) / (targetY - startY);
            const initialBlur = 0.85; // 매우 강한 블러로 시작
            const finalOpacity = 0.3; // 최종적으로 더 선명해짐
            const currentOpacity = finalOpacity + (1.0 - finalOpacity) * (1.0 - opacityProgress);
            material.uniforms.opacity.value = Math.max(0, Math.min(currentOpacity, 1.0));
            
            // moveState는 거의 0에 가깝게 유지 (매우 천천히 움직임)
            material.uniforms.moveState.value = Math.max(0, Math.min(wavePhase + microWave, 0.02));
    } else {
            // 딜레이 전에는 초기 상태 유지
            meshRef.current.position.y = -6;
            material.uniforms.opacity.value = 0;
          }
        } 
        // 음성 입력 후 애니메이션
        else {
          const currentTime = Date.now();
          const elapsedTime = (currentTime - animationStateRef.current.startTime) / 1000;
          const waitDuration = 3.0; // 3초 대기
          const blurTransitionDuration = 1.0; // 1초 동안 블러 복귀
          const stretchDuration = 1.5; // 1.5초 동안 늘어남
          const moveUpDuration = 1.5; // 1.5초 동안 위로 이동

          // 전체 진행도 계산
          const totalDuration = waitDuration + blurTransitionDuration + stretchDuration + moveUpDuration;
          const progress = Math.min(elapsedTime / totalDuration, 1.0);

          // 각 단계의 시작/끝 지점 (0~1 범위)
          const waitEnd = waitDuration / totalDuration;
          const blurEnd = (waitDuration + blurTransitionDuration) / totalDuration;
          const stretchEnd = (waitDuration + blurTransitionDuration + stretchDuration) / totalDuration;

          // 기본 위치와 스케일
          let posY = -0.8;
          let scaleY = 1.4;
          let opacity = 1.0;
          material.uniforms.moveState.value = 0.0;

          if (progress <= waitEnd) {
            // 대기 상태 - 완전히 선명하게
            opacity = 1.0;
            meshRef.current.scale.set(1.4, 1.4, 1.4);
          } 
          else if (progress <= blurEnd) {
            // 블러 복귀 단계 - 매우 강한 블러로
            const blurProgress = (progress - waitEnd) / (blurEnd - waitEnd);
            const blurEased = blurProgress * blurProgress; // quad ease-in
            opacity = 1.0 - blurEased * 0.95; // 거의 완전히 흐려짐
          }
          else if (progress <= stretchEnd) {
            // 늘어나는 단계
            const stretchProgress = (progress - blurEnd) / (stretchEnd - blurEnd);
            const stretchEased = stretchProgress < 0.5
              ? 2 * stretchProgress * stretchProgress
              : 1 - Math.pow(-2 * stretchProgress + 2, 2) / 2;
            
            // 늘어날수록 극도로 블러해짐
            const stretchBlur = 0.92 + stretchEased * 0.07; // 0.92에서 0.99까지 극도로 강한 블러
            opacity = 1.0 - stretchBlur; // 거의 완전히 투명해져서 배경과 완전히 블렌딩
            
            // 세로로 늘어나는 효과
            scaleY = 1.4 * (1.0 + stretchEased * 0.6);

            if (onGradientUpdate) {
              onGradientUpdate(0);
            }
          }
          else {
            // 위로 이동하는 단계
            const moveUpProgress = (progress - stretchEnd) / (1 - stretchEnd);
            const eased = 1 - Math.pow(1 - moveUpProgress, 2); // quad ease-out
            
            // 위치 계산
            const startY = -0.8;
            const targetY = 2;
            posY = startY + (targetY - startY) * eased;
            
            // 늘어난 상태에서 원래 크기로 복귀
            const stretchReverse = 1.0 - eased;
            scaleY = 1.4 * (1.0 + Math.max(0, stretchReverse * 0.6));
            
            // 블러 상태 유지
            opacity = 0.7;
            
            // 최종 위치와 스케일 적용
            meshRef.current.position.y = posY;
            meshRef.current.scale.set(1.4, scaleY, 1.4);
            material.uniforms.opacity.value = opacity;
            // 이동 완료 후 시퀀스 관리
            const textDelay = 2.0; // 2초 후 응답 표시
            const responseDisplayDuration = 3.0; // 3초 동안 응답 표시
            const algorithmDelay = 0.5; // 응답 사라지고 0.5초 후 알고리즘 표시
            const gradientDuration = 0.7; // 0.7초 동안 부드럽게 반전
            
            const gradientTime = elapsedTime - waitDuration - blurTransitionDuration - stretchDuration - moveUpDuration;
            
            // 2초 후 응답 텍스트 표시
            if (gradientTime >= textDelay && !moveUpTimerRef.current) {
              moveUpTimerRef.current = 'response'; // 응답 표시 상태
              if (onMoveComplete) {
                onMoveComplete(); // 응답 표시 트리거
              }
            }

            // 5초 후 (2초 대기 + 3초 표시) 응답 숨기기 및 추가 상승 시작
            if (gradientTime >= textDelay + responseDisplayDuration && moveUpTimerRef.current === 'response') {
              moveUpTimerRef.current = 'hiding'; // 숨기기 상태
              if (onHideResponse) {
                onHideResponse(); // 응답 숨기기 트리거
              }
              
              // 스피어 추가 상승 시작
              const additionalRise = 1.5; // 추가로 올라갈 높이
              meshRef.current.position.y += additionalRise * delta; // 천천히 상승
            }

            // 5.5초 후 알고리즘 표시 시작
            if (gradientTime >= textDelay + responseDisplayDuration + algorithmDelay && moveUpTimerRef.current === 'hiding') {
              moveUpTimerRef.current = 'algorithm'; // 알고리즘 표시 상태
              if (onShowAlgorithm) {
                onShowAlgorithm(); // 알고리즘 표시 트리거
              }
            }

            // 그라데이션 반전
            const transitionTime = gradientTime - textDelay;
            if (transitionTime > 0) {
              const gradientProgress = Math.min(transitionTime / gradientDuration, 1.0);
              
              // 더 부드러운 quintic ease-in-out으로 전환
              const t = gradientProgress < 0.5
                ? 16 * gradientProgress * gradientProgress * gradientProgress * gradientProgress * gradientProgress // quintic ease-in
                : 1 - Math.pow(-2 * gradientProgress + 2, 5) / 2; // quintic ease-out
              
              // 웨이브는 거의 정지된 것처럼
              const waveSpeed = 0.02; // 거의 멈춘 듯한 웨이브
              const waveAmplitude = 0.04 * Math.pow(1 - gradientProgress, 4); // 매우 작은 진폭
              const wavePhase = Math.sin(time * waveSpeed) * waveAmplitude;
              
              // 극도로 미세한 움직임
              const microWave = Math.sin(time * 0.008) * 0.005 * (1 - Math.pow(gradientProgress, 5));
              
              // 거의 보이지 않는 흔들림
              const nanoWave = Math.sin(time * 0.003) * 0.002 * (1 - Math.pow(gradientProgress, 6));
              
              // 추가 미세 움직임
              const picoWave = Math.sin(time * 0.001) * 0.001 * (1 - Math.pow(gradientProgress, 7));
              
              const baseState = t + (wavePhase + microWave + nanoWave + picoWave);
              
              material.uniforms.moveState.value = Math.max(0, Math.min(baseState, 1.0));
              
              // 배경 그라데이션도 함께 업데이트
              if (onGradientUpdate) {
                onGradientUpdate(baseState);
              }
            }
            
            // 이동하면서 다시 블러지도록 오퍼시티 조정
            material.uniforms.opacity.value = 1.0 - eased * 0.3;
          }
        }
    } else {
      material.uniforms.opacity.value = 0
      velocityRef.current = 0
    }
  })

  // voiceText가 변경될 때의 애니메이션 상태 관리
  const animationStateRef = useRef({
    startTime: 0,
    phase: 'none' // 'none', 'wait', 'clear', 'moveUp'
  });

  useEffect(() => {
    if (voiceText) {
      animationStateRef.current = {
        startTime: Date.now(),
        phase: 'wait'
      };
      // 새로운 음성 입력이 시작될 때 moveUpTimerRef 초기화
      moveUpTimerRef.current = null;
    } else if (chatEnabled) {
      // 초기 등장 시 시간 초기화
      animationStateRef.current = {
        startTime: Date.now(),
        phase: 'initial'
      };
    }
  }, [voiceText, chatEnabled]);

  const meshRef = useRef()
  const { viewport } = useThree()
  const v = viewport.getCurrentViewport()
  const radius = Math.min(v.width, v.height) * 0.33
  const margin = v.height * 0.035
  const yBottom = -v.height / 2 + radius + margin

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 5, 5]} intensity={1.0} />
      <mesh 
        ref={meshRef} 
        position={[0, chatEnabled ? -6 : -6, 0]}
        scale={chatEnabled ? 1.4 : 0.001}
        visible={chatEnabled}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>
    </>
  )
}