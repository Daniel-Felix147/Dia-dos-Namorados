/**
 * Surpresa para Larissa — login, vídeo e música de fundo.
 */

(function () {
    'use strict';

    var USUARIO_ADMIN = 'hesoyam';
    var SENHA_ADMIN = 'yecgaa';
    var USUARIO_VISITANTE = 'visitante';
    var SENHA_VISITANTE_OPCIONAL = 'visitante';

    /** Cole aqui o link do Google Maps do encontro (deixe vazio para ocultar o botão). */
    var LINK_GOOGLE_MAPS_CONVITE = '';

    var LS_VISITANTE_CONCLUIU = 'fujao_visitante_concluiu';
    var SS_SESSAO = 'fujao_sessao';

    var viewLogin = document.getElementById('view-login');
    var viewBloqueado = document.getElementById('view-bloqueado');
    var viewVideo = document.getElementById('view-video');
    var adminBar = document.getElementById('admin-bar');

    var formLogin = document.getElementById('form-login');
    var btnResetVisitante = document.getElementById('btn-reset-visitante');
    var btnSairAdmin = document.getElementById('btn-sair-admin');
    var btnVoltarLoginBloqueado = document.getElementById('btn-voltar-login-bloqueado');

    var videoFinal = document.getElementById('video-final');
    var audioMusica = document.getElementById('musica');
    var elTextoPreVideo = document.getElementById('texto-pre-video');
    var textoScrollViewport = document.getElementById('texto-scroll-viewport');
    var textoScrollInner = document.getElementById('texto-scroll-inner');
    var painelVideo = document.querySelector('.painel-video');
    var videoCentro = document.getElementById('video-centro');

    /** Velocidade da rolagem (px/s) — menor = mais lento */
    var VELOCIDADE_TEXTO_DESKTOP = 18;
    var VELOCIDADE_TEXTO_MOBILE = 12;
    var DURACAO_MINIMA_DESKTOP_MS = 20000;
    var DURACAO_MINIMA_MOBILE_MS = 28000;


    function isMobile() {
        return window.matchMedia('(max-width: 600px)').matches;
    }

    function obterVelocidadeTextoPxS() {
        return isMobile() ? VELOCIDADE_TEXTO_MOBILE : VELOCIDADE_TEXTO_DESKTOP;
    }

    function obterDuracaoMinimaMs() {
        return isMobile() ? DURACAO_MINIMA_MOBILE_MS : DURACAO_MINIMA_DESKTOP_MS;
    }

    function prefereMovimentoReduzido() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    var animacaoTextoAtual = null;

    /** Texto exibido antes do vídeo (deixe vazio para usar frases aleatórias de TEXTOS_PRE_VIDEO) */
    var TEXTO_PRE_VIDEO_FIXO =
        'O amor se revela nos pequenos gestos, nos olhares que dizem tudo sem precisar de palavras e nos sentimentos que crescem a cada dia. Neste Dia dos Namorados, quero celebrar tudo o que você representa para mim: a felicidade dos nossos momentos juntos, a força da nossa conexão e a certeza de que encontrei alguém verdadeiramente especial.\n\n' +
        'Meu amor, hoje quero dizer o quanto você merece as mais belas palavras que existem. Talvez eu não demonstre todos os dias, da forma que você merece, o tamanho da minha admiração e do meu amor por você. Mas saiba que você é a mulher da minha vida, aquela que trouxe mais cor aos meus dias, renovou minha fé no amor e me mostrou que compartilhar a vida ao lado da pessoa certa torna tudo mais bonito.\n\n' +
        'Neste Dia dos Namorados, quero agradecer por cada sorriso, cada carinho e por ser essa mulher incrível que faz meu coração se apaixonar por você todos os dias. Eu te amo e me sinto privilegiado por ter você ao meu lado. ❤️';

    var TEXTOS_PRE_VIDEO = [];

    // ========== Sessão e localStorage ==========

    function getSessao() {
        return sessionStorage.getItem(SS_SESSAO);
    }

    function setSessao(papel) {
        sessionStorage.setItem(SS_SESSAO, papel);
    }

    function limparSessao() {
        sessionStorage.removeItem(SS_SESSAO);
    }

    function visitanteJaConcluiu() {
        return localStorage.getItem(LS_VISITANTE_CONCLUIU) === '1';
    }

    function marcarVisitanteConcluiu() {
        if (getSessao() === 'visitante') {
            localStorage.setItem(LS_VISITANTE_CONCLUIU, '1');
        }
    }

    function bloquearVisitanteAposVideo() {
        marcarVisitanteConcluiu();
        limparSessao();
        atualizarBarraAdmin();
        pararAnimacaoTexto();
        pararMusicaFundo();
        pausarVideo();
        mostrarView(viewBloqueado);
    }

    function configurarBloqueioAposVideo() {
        if (!videoFinal) return;
        videoFinal.addEventListener('ended', function () {
            if (getSessao() === 'visitante') {
                bloquearVisitanteAposVideo();
            }
        });
    }

    function resetarAcessoVisitante() {
        localStorage.removeItem(LS_VISITANTE_CONCLUIU);
    }

    // ========== Navegação ==========

    function mostrarView(viewEl) {
        [viewLogin, viewBloqueado, viewVideo].forEach(function (v) {
            v.classList.remove('view-ativa');
        });
        viewEl.classList.add('view-ativa');
    }

    function atualizarBarraAdmin() {
        if (getSessao() === 'admin') {
            adminBar.classList.add('visivel');
        } else {
            adminBar.classList.remove('visivel');
        }
    }

    // ========== Áudio e vídeo ==========

    function pararMusicaFundo() {
        if (!audioMusica) return;
        audioMusica.onended = null;
        audioMusica.loop = false;
        audioMusica.pause();
    }

    /** Toca musica.mp3 inteira (do início ao fim do arquivo). */
    function tentarTocarMusica() {
        if (!audioMusica || !audioMusica.play) return;

        pararMusicaFundo();
        audioMusica.currentTime = 0;

        function iniciar() {
            audioMusica.loop = false;
            audioMusica.play().catch(function () { /* autoplay bloqueado */ });
        }

        if (audioMusica.readyState >= 1) {
            iniciar();
        } else {
            audioMusica.addEventListener('canplay', iniciar, { once: true });
        }
    }

    function configurarMusicaNaPrimeiraInteracaoLogin() {
        function estaNaTelaLogin() {
            return viewLogin && viewLogin.classList.contains('view-ativa');
        }

        function aoPrimeiroGesto() {
            if (!estaNaTelaLogin() || !audioMusica) return;
            tentarTocarMusica();
            viewLogin.removeEventListener('pointerdown', aoPrimeiroGesto);
            viewLogin.removeEventListener('keydown', aoPrimeiroGesto);
            viewLogin.removeEventListener('touchstart', aoPrimeiroGesto);
        }

        viewLogin.addEventListener('pointerdown', aoPrimeiroGesto, { passive: true });
        viewLogin.addEventListener('keydown', aoPrimeiroGesto);
        viewLogin.addEventListener('touchstart', aoPrimeiroGesto, { passive: true });
    }

    function tentarTocarVideo() {
        if (!videoFinal) return;
        videoFinal.muted = true;
        videoFinal.play().catch(function () { /* autoplay bloqueado */ });
    }

    function definirTextoPreVideo() {
        if (!elTextoPreVideo) return;
        var texto;
        if (TEXTO_PRE_VIDEO_FIXO && TEXTO_PRE_VIDEO_FIXO.trim()) {
            texto = TEXTO_PRE_VIDEO_FIXO.trim();
        } else if (TEXTOS_PRE_VIDEO.length) {
            var i = Math.floor(Math.random() * TEXTOS_PRE_VIDEO.length);
            texto = TEXTOS_PRE_VIDEO[i];
        } else {
            texto = '';
        }
        elTextoPreVideo.textContent = texto;
        elTextoPreVideo.style.whiteSpace = 'pre-line';
    }

    function esconderVideoCentro() {
        if (videoCentro) {
            videoCentro.classList.remove('visivel');
            videoCentro.setAttribute('aria-hidden', 'true');
        }
        if (painelVideo) {
            painelVideo.classList.remove('mostrar-video');
        }
    }

    function mostrarVideoCentro() {
        if (painelVideo) {
            painelVideo.classList.add('mostrar-video');
        }
        if (videoCentro) {
            videoCentro.classList.add('visivel');
            videoCentro.setAttribute('aria-hidden', 'false');
        }
        tentarTocarVideo();
    }

    function pararAnimacaoTexto() {
        if (animacaoTextoAtual) {
            animacaoTextoAtual.cancel();
            animacaoTextoAtual = null;
        }
        if (textoScrollInner) {
            textoScrollInner.style.transform = '';
        }
        esconderVideoCentro();
    }

    function pausarVideo() {
        if (videoFinal) {
            videoFinal.pause();
            videoFinal.currentTime = 0;
        }
    }

    function iniciarRolagemTexto() {
        if (!textoScrollViewport || !textoScrollInner) {
            tentarTocarVideo();
            return;
        }

        pararAnimacaoTexto();
        pausarVideo();

        var alturaViewport = textoScrollViewport.clientHeight;
        var alturaConteudo = textoScrollInner.offsetHeight;
        var inicioY = alturaViewport;
        var fimY = -alturaConteudo;
        var distancia = inicioY - fimY;
        var velocidade = obterVelocidadeTextoPxS();
        var duracaoMs = Math.max(obterDuracaoMinimaMs(), (distancia / velocidade) * 1000);

        function aoTerminarRolagem() {
            mostrarVideoCentro();
        }

        if (prefereMovimentoReduzido()) {
            textoScrollInner.style.transform = 'translateY(0)';
            setTimeout(aoTerminarRolagem, 4000);
            return;
        }

        textoScrollInner.style.transform = 'translateY(' + inicioY + 'px)';

        animacaoTextoAtual = textoScrollInner.animate(
            [
                { transform: 'translateY(' + inicioY + 'px)' },
                { transform: 'translateY(' + fimY + 'px)' }
            ],
            { duration: duracaoMs, easing: 'linear', fill: 'forwards' }
        );

        animacaoTextoAtual.finished
            .then(function () {
                animacaoTextoAtual = null;
                aoTerminarRolagem();
            })
            .catch(function () { /* animação cancelada */ });
    }

    function abrirTelaVideo() {
        definirTextoPreVideo();
        esconderVideoCentro();
        mostrarView(viewVideo);
        tentarTocarMusica();

        requestAnimationFrame(function () {
            requestAnimationFrame(iniciarRolagemTexto);
        });
    }

    // ========== Login ==========

    function validarLogin(usuario, senha) {
        var u = (usuario || '').trim().toLowerCase();
        var s = (senha || '').trim();
        if (u === USUARIO_ADMIN && s === SENHA_ADMIN) return 'admin';
        if (u === USUARIO_VISITANTE) {
            if (s === '' || s === SENHA_VISITANTE_OPCIONAL) return 'visitante';
        }
        return null;
    }

    function entrar(papel) {
        setSessao(papel);
        atualizarBarraAdmin();
        abrirTelaVideo();
    }

    formLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        var usuario = document.getElementById('login-usuario').value;
        var senha = document.getElementById('login-senha').value;
        var papel = validarLogin(usuario, senha);

        if (!papel) {
            alert('Usuário ou senha inválidos.');
            return;
        }

        if (papel === 'visitante' && visitanteJaConcluiu()) {
            mostrarView(viewBloqueado);
            return;
        }

        entrar(papel);
    });

    // ========== Admin ==========

    btnResetVisitante.addEventListener('click', function () {
        resetarAcessoVisitante();
        alert('Acesso do visitante resetado. Larissa poderá abrir a surpresa novamente.');
    });

    btnSairAdmin.addEventListener('click', function () {
        limparSessao();
        atualizarBarraAdmin();
        pararAnimacaoTexto();
        pausarVideo();
        pararMusicaFundo();
        mostrarView(viewLogin);
        document.getElementById('login-usuario').value = '';
        document.getElementById('login-senha').value = '';
    });

    if (btnVoltarLoginBloqueado) {
        btnVoltarLoginBloqueado.addEventListener('click', function () {
            mostrarView(viewLogin);
        });
    }

    function configurarConviteMaps() {
        var elLink = document.getElementById('link-maps-convite');
        if (!elLink) return;

        var link = (LINK_GOOGLE_MAPS_CONVITE || '').trim();
        if (!link) {
            elLink.hidden = true;
            return;
        }

        elLink.href = link;
        elLink.hidden = false;
    }

    // ========== Início ==========

    mostrarView(viewLogin);
    configurarMusicaNaPrimeiraInteracaoLogin();
    configurarBloqueioAposVideo();
    configurarConviteMaps();
})();
