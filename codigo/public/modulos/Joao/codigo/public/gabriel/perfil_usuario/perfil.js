// perfil.js
(function(){
  const API_BASE = 'http://localhost:3000'

  function qs(id){ return document.getElementById(id) }

  const avatar = qs('avatar')
  const photo = qs('photo')
  const nomeEl = qs('nome')
  const idadeEl = qs('idade')
  const sobreTextEl = qs('sobreText')
  const editSobreBtn = qs('editSobreBtn')
  const saveSobreBtn = qs('saveSobreBtn')
  const cancelSobreBtn = qs('cancelSobreBtn')
  const sobreEdit = qs('sobreEdit')
  const sobreInput = qs('sobreInput')

  function getQueryId(){
    const params = new URLSearchParams(location.search)
    return params.get('id') || params.get('user') || null
  }

  function setAvatarLetter(name){
    avatar.textContent = name ? name.trim().charAt(0).toUpperCase() : 'A'
  }

  function computeAgeFromBirth(birth){
    if(!birth) return null
    // aceita formatos ISO yyyy-mm-dd ou dd/mm/yyyy
    let d = null
    if(/\d{4}-\d{2}-\d{2}/.test(birth)) d = new Date(birth)
    else if(/\d{2}\/\d{2}\/\d{4}/.test(birth)){
      const parts = birth.split('/')
      d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    } else {
      const parsed = Date.parse(birth)
      if(!isNaN(parsed)) d = new Date(parsed)
    }
    if(!d) return null
    const diff = Date.now() - d.getTime()
    const ageDt = new Date(diff)
    return Math.abs(ageDt.getUTCFullYear() - 1970)
  }

  let currentUser = null

  async function fetchUser(id){
    if(!id) return null
    try{
      const res = await fetch(`${API_BASE}/usuarios/${id}`)
      if(!res.ok) throw new Error('não encontrou')
      return await res.json()
    }catch(e){
      console.warn('Falha ao buscar via API, tentando fallback em /gabriel/db.json e localStorage', e)
      // tenta arquivo estático na pasta gabriel
      try{
        const res2 = await fetch('/gabriel/db.json')
        if(res2.ok){
          const blob = await res2.json()
          if(blob && Array.isArray(blob.usuarios)){
            const found = blob.usuarios.find(u => String(u.id) === String(id) || String(u.login) === String(id))
            if(found) return found
          }
        }
      }catch(_){ /* ignore */ }

      const stored = localStorage.getItem(`perfil-${id}`)
      return stored ? JSON.parse(stored) : null
    }
  }

  function showData(user){
    currentUser = user
    if(!user){ nomeEl.textContent = 'Usuário não encontrado'; idadeEl.textContent=''; return }
    const nome = user.nome || user.login || 'Sem nome'
    nomeEl.textContent = nome

    // idade: procura por 'idade' numérica ou 'nascimento'/'birth' para calcular
    let idade = user.idade || user.age || null
    if(!idade){
      idade = computeAgeFromBirth(user.nascimento || user.birthdate || user.birth)
    }
  idadeEl.textContent = idade ? `${idade} anos` : ''

    // foto: se existir campo foto (URL ou caminho relativo), tenta carregar e faz fallback
    if (user.foto) {
      const fotoVal = String(user.foto).trim();
      // função auxiliar para ativar a foto
      const showPhoto = (src) => {
        photo.src = src;
        photo.alt = `Foto de ${nome}`;
        photo.classList.remove('hidden');
        avatar.classList.add('hidden');
      };

      // primeiro tentativa: usar exatamente o valor fornecido
      showPhoto(fotoVal);

      // se a imagem falhar ao carregar, tentaremos caminhos alternativos
      photo.onerror = () => {
        // limpar handler para evitar loops
        photo.onerror = null;
        // se o valor não for absoluto (não começa com http ou /), tente caminhos relativos comuns
        if (!/^https?:\/\//i.test(fotoVal) && !fotoVal.startsWith('/')) {
          const attempts = [`/gabriel/${fotoVal}`, `/gabriel/img/${fotoVal}`];
          let i = 0;
          const tryNext = () => {
            if (i >= attempts.length) {
              photo.classList.add('hidden');
              avatar.classList.remove('hidden');
              setAvatarLetter(nome);
              return;
            }
            const alt = attempts[i++];
            showPhoto(alt);
            // se falhar, tentar próximo
            photo.onerror = tryNext;
          };
          tryNext();
        } else {
          // se já era absoluto ou com /, apenas cair para avatar
          photo.classList.add('hidden');
          avatar.classList.remove('hidden');
          setAvatarLetter(nome);
        }
      };
    } else {
      photo.classList.add('hidden');
      avatar.classList.remove('hidden');
      setAvatarLetter(nome);
    }

    // sobre
    const sobreVal = user.sobre || user.bio || user.descricao || ''
    sobreTextEl.textContent = sobreVal || 'Sem descrição.'
    sobreInput.value = sobreVal || ''
  }

  // salvar sobre: tenta PATCH no JSON Server, se falhar salva em localStorage (perfil-:id.sobre)
  async function saveSobre(id, text){
    if(!id) return false
    try{
      const res = await fetch(`${API_BASE}/usuarios/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ sobre: text })
      })
      if(!res.ok) throw new Error('PATCH falhou')
      const updated = await res.json()
      // atualizar cópia local e localStorage
      currentUser = Object.assign({}, currentUser, updated)
      localStorage.setItem(`perfil-${id}`, JSON.stringify(currentUser))
      return true
    }catch(e){
      console.warn('PATCH /usuarios falhou, salvando sobre em localStorage', e)
      // salva apenas o campo sobre em localStorage
      const key = `perfil-sobre-${id}`
      localStorage.setItem(key, text)
      // também update currentUser
      if(currentUser) currentUser.sobre = text
      return false
    }
  }

  function enterEditSobre(){
    sobreEdit.classList.remove('hidden')
    saveSobreBtn.classList.remove('hidden')
    cancelSobreBtn.classList.remove('hidden')
    editSobreBtn.classList.add('hidden')
    sobreInput.focus()
  }

  function exitEditSobre(){
    sobreEdit.classList.add('hidden')
    saveSobreBtn.classList.add('hidden')
    cancelSobreBtn.classList.add('hidden')
    editSobreBtn.classList.remove('hidden')
  }

  async function init(){
    const id = getQueryId()
    const user = await fetchUser(id)
    // se houver sobre salvo em localStorage (fallback) mas não no user, aplicar
    const savedSobre = localStorage.getItem(`perfil-sobre-${id}`)
    if(savedSobre){
      if(!user) user = {}
      user.sobre = savedSobre
    }
    showData(user)

    // ligar os eventos de editar sobre
    editSobreBtn.addEventListener('click', enterEditSobre)
    cancelSobreBtn.addEventListener('click', ()=>{ exitEditSobre(); sobreInput.value = user && (user.sobre || user.bio || '') })
    saveSobreBtn.addEventListener('click', async ()=>{
      const novo = sobreInput.value.trim()
      const ok = await saveSobre(id, novo)
      // refletir na UI
      sobreTextEl.textContent = novo || 'Sem descrição.'
      exitEditSobre()
      if(ok) alert('Sobre salvo no servidor')
      else alert('Sobre salvo localmente (offline)')
    })
  }

  document.addEventListener('DOMContentLoaded', init)
})();
