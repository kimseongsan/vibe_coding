class InteractiveTypingEffect {
    constructor() {
        // 기본 설정
        this.defaultMessages = [
            "오늘도 수고했어.",
            "지금 이 순간도 너의 일부야.",
            "괜찮아, 천천히 가도 돼.",
            "너는 충분히 잘하고 있어.",
            "잠시 쉬어가도 괜찮아.",
            "내일은 더 좋은 날이 될 거야."
        ];

        this.backgrounds = {
            sunset: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            night: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            forest: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            ocean: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            mountain: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
        };

        // 현재 설정
        this.settings = {
            messages: [...this.defaultMessages],
            background: 'sunset',
            font: 'Nanum Pen Script',
            typingSpeed: 100,
            effect: 'fade',
            animation: 'none'
        };

        // 타이핑 상태
        this.currentMessageIndex = 0;
        this.currentCharIndex = 0;
        this.isTyping = false;
        this.isDeleting = false;
        this.isPaused = false;
        this.typingTimeout = null;

        // 애니메이션 관련
        this.animationContainer = null;
        this.animationInterval = null;

        // DOM 요소들
        this.textElement = document.getElementById('typing-text');
        this.cursorElement = document.getElementById('cursor');
        this.settingsPanel = document.getElementById('settings-panel');
        this.mainScreen = document.getElementById('main-screen');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createAnimationContainer();
        this.applySettings();
        this.loadDefaultMessages();

        // 초기 시작
        setTimeout(() => {
            this.startTyping();
        }, 1000);
    }

    setupEventListeners() {
        // 기존 이벤트 리스너들
        document.getElementById('open-settings').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('apply-settings').addEventListener('click', () => {
            this.applyNewSettings();
        });

        document.getElementById('play-pause').addEventListener('click', () => {
            this.togglePlayPause();
        });

        // 배경 선택
        document.querySelectorAll('.bg-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.bg-option').forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // 타이핑 속도 슬라이더
        const speedSlider = document.getElementById('typing-speed');
        const speedValue = document.getElementById('speed-value');
        speedSlider.addEventListener('input', (e) => {
            speedValue.textContent = e.target.value + 'ms';
        });

        // ESC 키로 설정 패널 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSettings();
            }
        });
    }

    createAnimationContainer() {
        this.animationContainer = document.createElement('div');
        this.animationContainer.className = 'animation-container';
        document.body.appendChild(this.animationContainer);
    }

    openSettings() {
        this.settingsPanel.classList.add('active');
        this.pauseTyping();
    }

    closeSettings() {
        this.settingsPanel.classList.remove('active');
        if (!this.isPaused) {
            this.resumeTyping();
        }
    }

    loadDefaultMessages() {
        const messageInput = document.getElementById('message-input');
        messageInput.value = this.defaultMessages.join('\n');
    }

    applyNewSettings() {
        console.log('적용 버튼이 클릭되었습니다!'); // 디버깅용

        // 메시지 가져오기
        const messageInput = document.getElementById('message-input');
        if (!messageInput) {
            console.error('메시지 입력 요소를 찾을 수 없습니다!');
            return;
        }

        const messages = messageInput.value.split('\n').filter(msg => msg.trim() !== '');
        console.log('입력된 메시지들:', messages); // 디버깅용

        if (messages.length === 0) {
            alert('최소 하나의 메시지를 입력해주세요!');
            return;
        }

        // 설정들 가져오기
        const selectedBg = document.querySelector('.bg-option.active');
        const customBg = document.getElementById('custom-bg')?.value || '';
        const background = selectedBg ? selectedBg.dataset.bg : 'sunset';
        const font = document.getElementById('font-select')?.value || 'Nanum Pen Script';
        const typingSpeed = parseInt(document.getElementById('typing-speed')?.value || '100');
        const effect = document.getElementById('effect-select')?.value || 'fade';
        const animation = document.getElementById('animation-select')?.value || 'none';

        console.log('새로운 설정:', { messages, background, font, typingSpeed, effect, animation }); // 디버깅용

        // 설정 업데이트
        this.settings = {
            messages: messages,
            background: background,
            customBackground: customBg,
            font: font,
            typingSpeed: typingSpeed,
            effect: effect,
            animation: animation
        };

        // 설정 적용
        try {
            this.applySettings();
            this.resetTyping();
            this.closeSettings();

            // 새로운 설정으로 시작
            setTimeout(() => {
                this.startTyping();
            }, 500);

            console.log('설정이 성공적으로 적용되었습니다!'); // 디버깅용
        } catch (error) {
            console.error('설정 적용 중 오류 발생:', error);
            alert('설정 적용 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    applySettings() {
        // 배경 적용
        if (this.settings.customBackground) {
            document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${this.settings.customBackground}') center/cover no-repeat`;
        } else {
            const bgUrl = this.backgrounds[this.settings.background];
            document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${bgUrl}') center/cover no-repeat`;
        }

        // 폰트 적용
        this.textElement.style.fontFamily = `'${this.settings.font}', cursive`;
        this.cursorElement.style.fontFamily = `'${this.settings.font}', cursive`;

        // 애니메이션 적용
        this.applyAnimation();
    }

    applyAnimation() {
        // 기존 애니메이션 정리
        this.clearAnimation();

        if (this.settings.animation === 'none') return;

        switch (this.settings.animation) {
            case 'snow':
                this.createSnowAnimation();
                break;
            case 'stars':
                this.createStarAnimation();
                break;
            case 'petals':
                this.createPetalAnimation();
                break;
            case 'bubbles':
                this.createBubbleAnimation();
                break;
            case 'fireflies':
                this.createFireflyAnimation();
                break;
        }
    }

    clearAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        this.animationContainer.innerHTML = '';
    }

    createSnowAnimation() {
        const createSnowflake = () => {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.innerHTML = '❄';
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
            snowflake.style.opacity = Math.random();
            this.animationContainer.appendChild(snowflake);

            setTimeout(() => {
                if (snowflake.parentNode) {
                    snowflake.parentNode.removeChild(snowflake);
                }
            }, 5000);
        };

        this.animationInterval = setInterval(createSnowflake, 300);
    }

    createStarAnimation() {
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.innerHTML = '✨';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 2 + 's';
            this.animationContainer.appendChild(star);
        }
    }

    createPetalAnimation() {
        const createPetal = () => {
            const petal = document.createElement('div');
            petal.className = 'petal';
            petal.innerHTML = '🌸';
            petal.style.left = Math.random() * 100 + '%';
            petal.style.animationDuration = (Math.random() * 4 + 3) + 's';
            this.animationContainer.appendChild(petal);

            setTimeout(() => {
                if (petal.parentNode) {
                    petal.parentNode.removeChild(petal);
                }
            }, 7000);
        };

        this.animationInterval = setInterval(createPetal, 500);
    }

    createBubbleAnimation() {
        const createBubble = () => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.style.left = Math.random() * 100 + '%';
            bubble.style.animationDuration = (Math.random() * 4 + 4) + 's';
            bubble.style.width = bubble.style.height = (Math.random() * 30 + 10) + 'px';
            this.animationContainer.appendChild(bubble);

            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
            }, 8000);
        };

        this.animationInterval = setInterval(createBubble, 800);
    }

    createFireflyAnimation() {
        for (let i = 0; i < 15; i++) {
            const firefly = document.createElement('div');
            firefly.className = 'firefly';
            firefly.style.left = Math.random() * 100 + '%';
            firefly.style.top = Math.random() * 100 + '%';
            firefly.style.animationDelay = Math.random() * 8 + 's';
            this.animationContainer.appendChild(firefly);
        }
    }

    startTyping() {
        if (this.isPaused) return;
        this.isTyping = true;
        this.typeMessage();
    }

    typeMessage() {
        if (this.isPaused) return;

        const currentMessage = this.settings.messages[this.currentMessageIndex];

        if (!this.isDeleting && this.currentCharIndex < currentMessage.length) {
            // 타이핑 중
            this.textElement.textContent = currentMessage.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;

            this.typingTimeout = setTimeout(() => this.typeMessage(), this.settings.typingSpeed);

        } else if (!this.isDeleting && this.currentCharIndex === currentMessage.length) {
            // 메시지 완성 - 2초 대기 후 다음 메시지로
            this.typingTimeout = setTimeout(() => {
                this.nextMessage();
            }, 2000);

        } else if (this.isDeleting && this.currentCharIndex > 0) {
            // 삭제 중
            this.textElement.textContent = currentMessage.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;

            this.typingTimeout = setTimeout(() => this.typeMessage(), 50);

        } else if (this.isDeleting && this.currentCharIndex === 0) {
            // 삭제 완료 - 다음 메시지 시작
            this.isDeleting = false;
            this.currentMessageIndex = (this.currentMessageIndex + 1) % this.settings.messages.length;

            this.typingTimeout = setTimeout(() => this.typeMessage(), this.settings.typingSpeed);
        }
    }

    nextMessage() {
        if (this.isPaused) return;

        // 현재 이펙트 제거
        this.textElement.className = 'typing-text';

        // 페이드아웃 효과
        this.textElement.style.opacity = '0';
        this.textElement.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            this.isDeleting = true;

            // 새로운 이펙트 적용
            this.textElement.className = `typing-text effect-${this.settings.effect}`;
            this.textElement.style.opacity = '1';
            this.textElement.style.transform = 'translateY(0)';

            this.typeMessage();
        }, 500);
    }

    togglePlayPause() {
        const playPauseBtn = document.getElementById('play-pause');
        const iconElement = playPauseBtn.querySelector('.icon');
        const tooltipElement = playPauseBtn.querySelector('.tooltip');

        if (this.isPaused) {
            this.isPaused = false;
            iconElement.textContent = '⏸️';
            tooltipElement.textContent = '일시정지';
            this.resumeTyping();
        } else {
            this.isPaused = true;
            iconElement.textContent = '▶️';
            tooltipElement.textContent = '재생';
            this.pauseTyping();
        }
    }

    pauseTyping() {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
    }

    resumeTyping() {
        if (this.isTyping) {
            this.typeMessage();
        }
    }

    resetTyping() {
        this.pauseTyping();
        this.currentMessageIndex = 0;
        this.currentCharIndex = 0;
        this.isTyping = false;
        this.isDeleting = false;
        this.textElement.textContent = '';
    }
}

// 페이지 로드 완료 후 시작
document.addEventListener('DOMContentLoaded', () => {
    // 타이핑 효과 시작
    new InteractiveTypingEffect();
});