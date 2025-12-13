// Sistema de autenticação para Desliga AI
class AuthManager {
    constructor() {
        this.API_URL = 'http://localhost:3000';
        this.currentUserKey = 'desligaAI_currentUser';
    }

    // Registrar novo usuário
    async register(userData) {
        try {
            // Validar senha
            if (userData.password !== userData.confirmPassword) {
                throw new Error('As senhas não coincidem');
            }

            if (userData.password.length < 6) {
                throw new Error('A senha deve ter pelo menos 6 caracteres');
            }

            // Verificar se o email já existe
            const existingUsers = await this.getUsers();
            if (existingUsers.some(u => u.email === userData.email)) {
                throw new Error('Este e-mail já está cadastrado');
            }

            // Criar objeto do usuário
            const newUser = {
                nome: userData.fullName,
                email: userData.email,
                phone: userData.phone || '',
                password: this.hashPassword(userData.password),
                dataCadastro: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                points: 0,
                level: 1,
                theme: 'light',
                preferences: {
                    goal: userData.goal || 'reduce_screen',
                    screenTime: userData.screenTime || '4_6h',
                    newsletter: userData.newsletter || false,
                    notifications: true
                }
            };

            // Salvar no db.json via API
            const response = await fetch(`${this.API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            if (!response.ok) {
                throw new Error('Erro ao criar conta. Tente novamente.');
            }

            const createdUser = await response.json();

            // Logar automaticamente
            await this.login(userData.email, userData.password);

            return {
                success: true,
                user: this.sanitizeUser(createdUser),
                message: 'Conta criada com sucesso!'
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Login
    async login(email, password) {
        try {
            const users = await this.getUsers();
            const user = users.find(u => u.email === email);

            if (!user) {
                throw new Error('E-mail não encontrado');
            }

            // Verificar senha (em produção: usar bcrypt.compare)
            if (this.hashPassword(password) !== user.password) {
                throw new Error('Senha incorreta');
            }

            // Atualizar último login
            const updatedUser = {
                ...user,
                lastLogin: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await fetch(`${this.API_URL}/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            });

            // Salvar usuário atual no localStorage
            localStorage.setItem(this.currentUserKey, JSON.stringify(this.sanitizeUser(updatedUser)));

            return {
                success: true,
                user: this.sanitizeUser(updatedUser),
                message: 'Login realizado com sucesso!'
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Logout
    logout() {
        localStorage.removeItem(this.currentUserKey);
        return {
            success: true,
            message: 'Logout realizado com sucesso'
        };
    }

    // Verificar se está logado
    isLoggedIn() {
        return !!this.getCurrentUser();
    }

    // Obter usuário atual
    getCurrentUser() {
        const user = localStorage.getItem(this.currentUserKey);
        return user ? JSON.parse(user) : null;
    }

    // Obter todos os usuários
    async getUsers() {
        try {
            const response = await fetch(`${this.API_URL}/users`);
            if (!response.ok) {
                // Fallback para localStorage se API não estiver disponível
                const fallback = localStorage.getItem('desligaAI_users');
                return fallback ? JSON.parse(fallback) : [];
            }
            return await response.json();
        } catch (error) {
            console.warn('API não disponível, usando fallback:', error);
            // Fallback para localStorage se API não estiver disponível
            const fallback = localStorage.getItem('desligaAI_users');
            return fallback ? JSON.parse(fallback) : [];
        }
    }

    // Verificar se usuário existe
    async userExists(email) {
        const users = await this.getUsers();
        return users.some(user => user.email === email);
    }

    // Atualizar usuário
    async updateUser(userId, updates) {
        try {
            const updatedUser = {
                ...updates,
                updatedAt: new Date().toISOString()
            };

            const response = await fetch(`${this.API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            });

            if (!response.ok) {
                return false;
            }

            const updated = await response.json();

            // Atualizar usuário atual se for o mesmo
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                localStorage.setItem(this.currentUserKey, JSON.stringify(this.sanitizeUser(updated)));
            }

            return true;
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return false;
        }
    }

    // Gerar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Hash de senha simples (APENAS PARA DEMO)
    hashPassword(password) {
        // Em produção, use: bcrypt.hash(password, 10)
        return btoa(password); // Não seguro! Apenas para demonstração
    }

    // Sanitizar dados do usuário (remover informações sensíveis)
    sanitizeUser(user) {
        const sanitized = { ...user };
        delete sanitized.password;
        return sanitized;
    }

    // Verificar força da senha
    checkPasswordStrength(password) {
        let strength = 0;
        const requirements = [];
        
        // Verificar comprimento
        if (password.length >= 8) strength += 1;
        else requirements.push("Pelo menos 8 caracteres");
        
        // Verificar letras maiúsculas e minúsculas
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
        else requirements.push("Letras maiúsculas e minúsculas");
        
        // Verificar números
        if (/\d/.test(password)) strength += 1;
        else requirements.push("Pelo menos um número");
        
        // Verificar caracteres especiais
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        else requirements.push("Pelo menos um caractere especial");
        
        const strengthTexts = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
        const strengthColors = ['#ff0000', '#ff6b6b', '#ffa500', '#4CAF50', '#2E7D32'];
        
        return {
            score: strength,
            text: strengthTexts[strength],
            color: strengthColors[strength],
            requirements: requirements
        };
    }
}

// Instância global
const authManager = new AuthManager();

// ========== INICIALIZAÇÃO ==========

document.addEventListener('DOMContentLoaded', function() {
    // Verificar qual página estamos
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        setupLoginForm();
    }
    
    if (signupForm) {
        setupSignupForm();
    }
    
    // Verificar se já está logado
    if (authManager.isLoggedIn() && window.location.pathname.includes('login.html')) {
        // Redirecionar para página principal se estiver logado
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 100);
    }
});

// ========== LOGIN ==========

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberCheck = document.getElementById('remember');
    
    // Preencher email salvo
    const savedEmail = localStorage.getItem('desligaAI_rememberEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberCheck.checked = true;
    }
    
    // Login com Google
    document.getElementById('googleLogin').addEventListener('click', function() {
        showMessage('⚠️ Login com Google em desenvolvimento', 'warning');
    });
    
    // Login com Facebook
    document.getElementById('facebookLogin').addEventListener('click', function() {
        showMessage('⚠️ Login com Facebook em desenvolvimento', 'warning');
    });
    
    // Esqueci senha
    document.getElementById('forgotPassword').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('⚠️ Recuperação de senha em desenvolvimento', 'warning');
    });
    
    // Submit do formulário
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const remember = rememberCheck.checked;
        
        if (!email || !password) {
            showMessage('Por favor, preencha todos os campos', 'error');
            return;
        }
        
        // Validar email
        if (!isValidEmail(email)) {
            showMessage('Por favor, informe um e-mail válido', 'error');
            return;
        }
        
        // Mostrar loading
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="bi bi-hourglass"></i> Entrando...';
        submitBtn.disabled = true;
        
        try {
            const result = await authManager.login(email, password);
            
            if (result.success) {
                showMessage('✅ Login realizado com sucesso!', 'success');
                
                // Salvar email se marcado "lembrar de mim"
                if (remember) {
                    localStorage.setItem('desligaAI_rememberEmail', email);
                } else {
                    localStorage.removeItem('desligaAI_rememberEmail');
                }
                
                // Redirecionar após 1.5 segundos
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                showMessage(`❌ ${result.message}`, 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            showMessage(`❌ ${error.message}`, 'error');
            
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== CADASTRO ==========

function setupSignupForm() {
    let currentStep = 1;
    const totalSteps = 3;
    
    // Elementos dos passos
    const steps = [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3')
    ];
    
    const stepContents = [
        document.getElementById('step1-content'),
        document.getElementById('step2-content'),
        document.getElementById('step3-content')
    ];
    
    // Elementos do formulário
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const goalSelect = document.getElementById('goal');
    const screenTimeSelect = document.getElementById('screenTime');
    const termsCheck = document.getElementById('terms');
    const newsletterCheck = document.getElementById('newsletter');
    
    // Botões de navegação
    document.getElementById('nextStep1').addEventListener('click', () => validateStep1());
    document.getElementById('prevStep2').addEventListener('click', () => goToStep(1));
    document.getElementById('nextStep2').addEventListener('click', validateStep2);
    document.getElementById('prevStep3').addEventListener('click', () => goToStep(2));
    document.getElementById('cancelBtn').addEventListener('click', () => {
        window.location.href = 'login.html';
    });
    
    // Validação de senha em tempo real
    passwordInput.addEventListener('input', function() {
        const strength = authManager.checkPasswordStrength(this.value);
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        strengthFill.style.width = `${strength.score * 25}%`;
        strengthFill.style.backgroundColor = strength.color;
        strengthText.textContent = `Força da senha: ${strength.text}`;
        strengthText.style.color = strength.color;
        
        // Verificar confirmação de senha
        if (confirmPasswordInput.value) {
            checkPasswordMatch();
        }
    });
    
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    
    // Submit do formulário
    document.getElementById('signupForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitSignup();
    });
    
    // Funções auxiliares
    function goToStep(step) {
        // Atualizar visual dos passos
        steps.forEach((s, index) => {
            s.classList.remove('active', 'completed');
            if (index < step - 1) s.classList.add('completed');
            if (index === step - 1) s.classList.add('active');
        });
        
        // Mostrar conteúdo do passo atual
        stepContents.forEach((c, index) => {
            c.classList.remove('active');
            if (index === step - 1) c.classList.add('active');
        });
        
        currentStep = step;
        
        // Scroll para o topo
        document.querySelector('.auth-card').scrollTop = 0;
    }
    
    async function validateStep1() {
        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (!fullName) {
            showMessage('Por favor, informe seu nome completo', 'error');
            return;
        }
        
        if (!email) {
            showMessage('Por favor, informe seu e-mail', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('Por favor, informe um e-mail válido', 'error');
            return;
        }
        
        // Verificar se email já existe
        const emailExists = await authManager.userExists(email);
        if (emailExists) {
            showMessage('Este e-mail já está cadastrado', 'error');
            return;
        }
        
        if (phone && !isValidPhone(phone)) {
            showMessage('Por favor, informe um telefone válido', 'error');
            return;
        }
        
        goToStep(2);
    }
    
    function validateStep2() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (password.length < 6) {
            showMessage('A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('As senhas não coincidem', 'error');
            return;
        }
        
        goToStep(3);
    }
    
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const matchElement = document.getElementById('passwordMatch');
        
        if (!password || !confirmPassword) return;
        
        if (password === confirmPassword) {
            matchElement.textContent = '✓ As senhas coincidem';
            matchElement.style.color = 'hsl(142 76% 36%)';
        } else {
            matchElement.textContent = '✗ As senhas não coincidem';
            matchElement.style.color = 'hsl(0 84% 60%)';
        }
    }
    
    async function submitSignup() {
        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const goal = goalSelect.value;
        const screenTime = screenTimeSelect.value;
        const newsletter = newsletterCheck.checked;
        const terms = termsCheck.checked;
        
        // Validar termos
        if (!terms) {
            showMessage('Você deve aceitar os Termos de Uso para continuar', 'error');
            return;
        }
        
        // Validar objetivo e tempo de tela
        if (!goal) {
            showMessage('Por favor, selecione seu objetivo principal', 'error');
            return;
        }
        
        if (!screenTime) {
            showMessage('Por favor, selecione seu tempo médio em telas', 'error');
            return;
        }
        
        // Mostrar loading
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="bi bi-hourglass"></i> Criando conta...';
        submitBtn.disabled = true;
        
        try {
            const result = await authManager.register({
                fullName,
                email,
                phone,
                password,
                confirmPassword,
                goal,
                screenTime,
                newsletter,
                terms
            });
            
            if (result.success) {
                showMessage('✅ Conta criada com sucesso!', 'success');
                
                // Redirecionar após 2 segundos
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 2000);
            } else {
                showMessage(`❌ ${result.message}`, 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            showMessage(`❌ ${error.message}`, 'error');
            
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// ========== FUNÇÕES UTILITÁRIAS ==========

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPhone(phone) {
    const re = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
    return re.test(phone);
}

function showMessage(message, type = 'info') {
    // Remover mensagens anteriores
    const existingMessages = document.querySelectorAll('.message-toast');
    existingMessages.forEach(msg => msg.remove());
    
    // Criar elemento da mensagem
    const toast = document.createElement('div');
    toast.className = 'message-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? 'hsl(142 76% 36% / 0.95)' : 
                    type === 'error' ? 'hsl(0 84% 60% / 0.95)' : 
                    type === 'warning' ? 'hsl(38 92% 50% / 0.95)' : 
                    'hsl(263 70% 50% / 0.95)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 1rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideDown 0.3s ease;
    `;
    
    // Ícone baseado no tipo
    const icon = type === 'success' ? '✓' :
                 type === 'error' ? '✗' :
                 type === 'warning' ? '⚠️' : 'ℹ️';
    
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    
    document.body.appendChild(toast);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
    
    // Adicionar estilos de animação
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateX(-50%) translateY(0); opacity: 1; }
                to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.authManager = authManager;
}