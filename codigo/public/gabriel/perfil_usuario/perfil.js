// perfil.js
(function(){
  const API_BASE = 'http://localhost:3000';

  // Seletores rápidos
  function qs(id){ return document.getElementById(id) }

  const avatar = qs('avatar');
  const photo = qs('photo');
  const nomeEl = qs('nome');
  const idadeEl = qs('idade');
  const sobreTextEl = qs('sobreText');
  const editSobreBtn = qs('editSobreBtn');
  const saveSobreBtn = qs('saveSobreBtn');
  const cancelSobreBtn = qs('cancelSobreBtn');
  const sobreEdit = qs('sobreEdit');
  const sobreInput = qs('sobreInput');

  function getQueryId(){
    const params = new URLSearchParams(location.search);
    return params.get('id') || params.get('user') || null;
  }

  function setAvatarLetter(name){
    avatar.textContent = name ? name.trim().charAt(0).toUpperCase() : 'A';
  }

  function computeAgeFromBirth(birth){
    if(!birth) return null;
    let d = null;
    if(/\d{4}-\d{2}-\d{2}/.test(birth)) d = new Date(birth);
    else if(/\d{2}\/\d{2}\/\d{4}/.test(birth)){
      const parts = birth.split('/');
      d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      const parsed = Date.parse(birth);
      if(!isNaN(parsed)) d = new Date(parsed);
    }
    if(!d) return null;
    const diff = Date.now() - d.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  }

  let currentUser = null;

  // Busca o usuário pelo ID numérico ou pelo login (suporta json-server /usuarios?login=)
  async function fetchUser(id){
    if(!id) return null;
    try{
      // se for número, tenta rota /usuarios/:id
      if (/^\d+$/.test(String(id))) {
        const res = await fetch(`${API_BASE}/usuarios/${id}`);
        if(res.ok) return await res.json();
        // se 404, continuar para tentativas abaixo
      }

      // tenta buscar por login via query (json-server retorna array)
      const resQ = await fetch(`${API_BASE}/usuarios?login=${encodeURIComponent(id)}`);
      if(resQ.ok){
        const arr = await resQ.json();
        if(Array.isArray(arr) && arr.length) return arr[0];
      }
    }catch(e){
      console.warn('Falha ao buscar via API (id/login)', e);
    }

    // fallback para arquivo estático e localStorage
    try{
      const res2 = await fetch('/gabriel/db.json');
      if(res2.ok){
        const blob = await res2.json();
        if(blob && Array.isArray(blob.usuarios)){
          const found = blob.usuarios.find(u => String(u.id) === String(id) || String(u.login) === String(id));
          if(found) return found;
        }
      }
    }catch(_){ /* ignora */ }

    const stored = localStorage.getItem(`perfil-${id}`);
    return stored ? JSON.parse(stored) : null;
  }

  function showData(user){
    currentUser = user;
    if(!user){
      nomeEl.textContent = 'Usuário não encontrado';
      idadeEl.textContent = '';
      photo.classList.add('hidden');
      avatar.classList.remove('hidden');
      setAvatarLetter(null);
      return;
    }

    const nome = user.nome || user.login || 'Sem nome';
    nomeEl.textContent = nome;

    // idade calculada
    let idade = user.idade || user.age || null;
    if(!idade){
      idade = computeAgeFromBirth(user.nascimento || user.birthdate || user.birth);
    }
    idadeEl.textContent = idade ? `${idade} anos` : '';

    // foto: tenta carregar variações do caminho (definir onerror antes de atribuir src)
    if (user.foto){
      const fotoVal = String(user.foto).trim();
      // Tentar várias formas: valor direto, caminhos relativos a esta página,
      // e caminhos absolutos a partir da raiz do site (/gabriel/...)
      const candidates = [
        fotoVal,
        `../img/${fotoVal}`, // caminho relativo a partir de perfil_usuario/
        `img/${fotoVal}`,    // caso o servidor sirva a partir da mesma pasta
        `./img/${fotoVal}`,
        `/gabriel/${fotoVal}`,
        `/gabriel/img/${fotoVal}`
      ];

      const trySrc = (i) => {
        if(i >= candidates.length){
          // fallback para avatar
          photo.classList.add('hidden');
          avatar.classList.remove('hidden');
          setAvatarLetter(nome);
          return;
        }
        const src = candidates[i];
        console.log('Tentando imagem:', src);
        photo.onload = () => {
          photo.alt = `Foto de ${nome}`;
          photo.classList.remove('hidden');
          avatar.classList.add('hidden');
        };
        photo.onerror = () => { trySrc(i+1); };
        photo.src = src;
      };
      trySrc(0);
    } else {
      photo.classList.add('hidden');
      avatar.classList.remove('hidden');
      setAvatarLetter(nome);
    }

    // campo "Sobre"
    const sobreVal = user.sobre || user.bio || user.descricao || '';
    sobreTextEl.textContent = sobreVal || 'Sem descrição.';
    sobreInput.value = sobreVal || '';
  }

  // Salvar "Sobre" (PATCH ou localStorage)
  async function saveSobre(id, text){
    if(!id) return false;
    try{
      const res = await fetch(`${API_BASE}/usuarios/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ sobre: text })
      });
      if(!res.ok) throw new Error('PATCH falhou');
      const updated = await res.json();
      currentUser = Object.assign({}, currentUser, updated);
      localStorage.setItem(`perfil-${id}`, JSON.stringify(currentUser));
      return true;
    }catch(e){
      console.warn('PATCH /usuarios falhou, salvando sobre em localStorage', e);
      const key = `perfil-sobre-${id}`;
      localStorage.setItem(key, text);
      if(currentUser) currentUser.sobre = text;
      return false;
    }
  }

  function enterEditSobre(){
    sobreEdit.classList.remove('hidden');
    saveSobreBtn.classList.remove('hidden');
    cancelSobreBtn.classList.remove('hidden');
    editSobreBtn.classList.add('hidden');
    sobreInput.focus();
  }

  function exitEditSobre(){
    sobreEdit.classList.add('hidden');
    saveSobreBtn.classList.add('hidden');
    cancelSobreBtn.classList.add('hidden');
    editSobreBtn.classList.remove('hidden');
  }

  async function init(){
    // 👇 Usa ID da URL OU o padrão (4)
    let id = getQueryId() || 4;

    // Busca o usuário
    let user = await fetchUser(id);

    // Fallback "sobre" salvo localmente
    const savedSobre = localStorage.getItem(`perfil-sobre-${id}`);
    if(savedSobre){
      if(!user) user = {};
      user.sobre = savedSobre;
    }

    showData(user);

    // Eventos de edição
    editSobreBtn.addEventListener('click', enterEditSobre);
    cancelSobreBtn.addEventListener('click', ()=>{ 
      exitEditSobre(); 
      sobreInput.value = user && (user.sobre || user.bio || ''); 
    });
    saveSobreBtn.addEventListener('click', async ()=>{
      const novo = sobreInput.value.trim();
      const ok = await saveSobre(id, novo);
      sobreTextEl.textContent = novo || 'Sem descrição.';
      exitEditSobre();
      alert(ok ? 'Sobre salvo no servidor' : 'Sobre salvo localmente (offline)');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
