
	/* Elokuvien admin-SPA - pelkkä Vanilla JS
		 Ominaisuudet: listaaminen, lisääminen, muokkaaminen, poisto (localStorage), demo-data
	*/
(function(){
	const STORAGE_KEY = 'movies';
	const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="100%" height="100%" fill="#e8e8e8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="18" fill="#777777">Kuvaa ei saatavilla</text></svg>');

	const demo = [
		{id: genId(), title:'Inception', image:'https://i.imgur.com/8Km9tLL.jpg', description:'A mind-bending thriller by Christopher Nolan.'},
		{id: genId(), title:'The Matrix', image:'https://i.imgur.com/fYt5KcS.jpg', description:'A hacker discovers reality is simulated.'},
		{id: genId(), title:'Spirited Away', image:'https://i.imgur.com/PmPViW5.jpeg', description:'A Studio Ghibli classic full of wonder.'},
		{id: genId(), title:'Parasite', image:'https://i.imgur.com/2l5YVQw.jpg', description:'Dark social satire from Bong Joon-ho.'}
	];

	let state = {movies:[], editingId:null, filter:''};

	/* Helpperi */
	function genId(){return 'm_'+Date.now().toString(36)+'_'+Math.floor(Math.random()*1000)}

	function load(){
		try{
			const raw = localStorage.getItem(STORAGE_KEY);
			if(!raw){
				state.movies = demo.slice();
				save();
			} else {
				state.movies = JSON.parse(raw) || [];
			}
		}catch(e){state.movies = demo.slice();}
	}

	function save(){localStorage.setItem(STORAGE_KEY, JSON.stringify(state.movies))}

	/* Renderöinti */
	const els = {};
	function cache(){
		els.form = document.getElementById('movie-form');
		els.title = document.getElementById('title');
		els.image = document.getElementById('image');
		els.description = document.getElementById('description');
		els.saveBtn = document.getElementById('save-btn');
		els.cancelBtn = document.getElementById('cancel-btn');
		els.list = document.getElementById('movies-list');
		els.search = document.getElementById('search');
	}

	function render(){
		renderForm();
		renderList();
	}

	function renderForm(){
		if(state.editingId){
			const m = state.movies.find(x=>x.id===state.editingId);
			if(m){
				els.title.value = m.title;
				els.image.value = m.image||'';
				els.description.value = m.description||'';
				els.saveBtn.textContent = 'Tallenna';
				els.cancelBtn.hidden = false;
			}
		} else {
			els.form.reset();
			els.saveBtn.textContent = 'Lisää';
			els.cancelBtn.hidden = true;
		}
	}

	function renderList(){
		const q = (state.filter||'').trim().toLowerCase();
		const nodes = [];
		els.list.innerHTML='';
		const filtered = state.movies.filter(m=>{
			if(!q) return true;
			return (m.title||'').toLowerCase().includes(q) || (m.description||'').toLowerCase().includes(q);
		});

		if(filtered.length===0){
			els.list.innerHTML = '<p>Ei elokuvia.</p>';
			return;
		}

		filtered.forEach(m=>{
			const card = document.createElement('article');
			card.className='movie-card';
			const imgSrc = (m.image && m.image.trim()) ? m.image.trim() : PLACEHOLDER;
			card.innerHTML = `
				<img class="movie-thumb" src=${JSON.stringify(imgSrc)} alt=${JSON.stringify(m.title)} onerror="this.onerror=null;this.src=${JSON.stringify(PLACEHOLDER)}" />
				<div class="movie-info">
					<h3 class="movie-title">${escapeHtml(m.title)}</h3>
					<p class="movie-desc">${escapeHtml(m.description||'')}</p>
					<div class="card-actions">
						<button class="btn edit" data-id="${m.id}">Muokkaa</button>
						<button class="btn delete" data-id="${m.id}">Poista</button>
					</div>
				</div>
			`;

			els.list.appendChild(card);
		});
	}

	/* Tapahtumakäsittelijät */
	function bind(){
		els.form.addEventListener('submit', onSubmit);
		els.cancelBtn.addEventListener('click', onCancel);
		els.list.addEventListener('click', onListClick);
		els.search.addEventListener('input', onSearch);
	}

	function onSubmit(e){
		e.preventDefault();
		const title = els.title.value.trim();
		if(!title){ alert('Nimi on pakollinen'); return; }
		const image = els.image.value.trim();
		const description = els.description.value.trim();

		if(state.editingId){
			const m = state.movies.find(x=>x.id===state.editingId);
			if(m){ m.title=title; m.image=image; m.description=description; }
			state.editingId = null;
		} else {
			state.movies.unshift({id: genId(), title, image, description});
		}
		save();
		render();
	}

	function onCancel(){ state.editingId = null; renderForm(); }

	function onListClick(e){
		const id = e.target.dataset && e.target.dataset.id;
		if(!id) return;
		if(e.target.classList.contains('edit')){
			state.editingId = id; render(); window.scrollTo({top:0,behavior:'smooth'});
		} else if(e.target.classList.contains('delete')){
			if(confirm('Poistetaanko elokuva?')){
				state.movies = state.movies.filter(m=>m.id!==id);
				save(); render();
			}
		}
	}

	function onSearch(e){ state.filter = e.target.value; renderList(); }

	/* Util-funktiot */
	function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

	/* Alustus */
	function init(){
		cache(); load(); bind(); render();
	}

	document.addEventListener('DOMContentLoaded', init);
    })();
    

