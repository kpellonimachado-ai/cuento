// Configuración de worker para PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// Elementos del DOM
const bookContainer = document.getElementById('flip-book');
const loading = document.getElementById('loading');
const pageTextContent = document.getElementById('page-text-content');
const pageIndicator = document.getElementById('page-indicator');
const screenReaderAnnounce = document.getElementById('screen-reader-announce');

// Botones
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnTts = document.getElementById('btn-tts');
const btnStopTts = document.getElementById('btn-stop-tts');
const btnFontIncrease = document.getElementById('btn-font-increase');
const btnFontDecrease = document.getElementById('btn-font-decrease');

// Variables de estado
let pageFlip = null;
let currentFontSizeRem = 1.0;
let pdfPagesText = []; // Guardará el texto extraído de cada página
let speechUtterance = null;
const PDF_PATH = './lamochiladelosproblemas.pdf';

// Al cargar la página iniciamos la carga del PDF alojado en el repositorio
window.addEventListener('DOMContentLoaded', () => {
    loadPDF(PDF_PATH);
});

// Función para simular un sonido de cambio de página realista usando Web Audio API
function playPageTurnSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = audioCtx.sampleRate * 0.15; // 150 ms
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        // Generar ruido blanco suave para imitar la hoja raspando
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        // Filtro para suavizar el ruido (sonido de papel)
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noise.start();
    } catch (e) {
        console.log("Audio Context no inicializado por interacción del usuario.");
    }
}

// Cargar y procesar el documento PDF
async function loadPDF(url) {
    loading.style.display = 'block';
    bookContainer.style.display = 'none';

    try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        const totalPages = pdf.numPages;
        pdfPagesText = [];

        const firstPage = await pdf.getPage(1);
        const viewportInfo = firstPage.getViewport({ scale: 1.5 });
        const pageWidth = viewportInfo.width;
        const pageHeight = viewportInfo.height;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });

            // Extraer texto plano para accesibilidad y TTS
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            pdfPagesText.push(pageText || 'Página visual sin texto ejecutable.');

            // Canvas para la representación gráfica del libro
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            const pageDiv = document.createElement('div');
            pageDiv.className = 'page';
            pageDiv.appendChild(canvas);

            bookContainer.appendChild(pageDiv);
        }

        bookContainer.style.display = 'block';

        // Inicializar el volteador de páginas
        pageFlip = new St.PageFlip(bookContainer, {
            width: pageWidth,
            height: pageHeight,
            size: "stretch",
            minWidth: 300,
            maxWidth: pageWidth,
            minHeight: 400,
            maxHeight: pageHeight,
            showCover: true,
            maxShadowOpacity: 0.6,
            usePortrait: true
        });

        const pages = document.querySelectorAll('.page');
        pageFlip.loadFromHTML(pages);

        loading.style.display = 'none';

        // Eventos al cambiar página
        pageFlip.on('flip', (e) => {
            playPageTurnSound();
            stopSpeech();
            updatePageInfo(e.data + 1);
        });

        updatePageInfo(1);

    } catch (error) {
        console.error('Error al cargar el PDF:', error);
        loading.innerText = 'Error al cargar "lamochiladelosproblemas.pdf". Verifica que el archivo exista en el repositorio.';
    }
}

// Actualizar indicadores y lector de pantalla
function updatePageInfo(pageNum) {
    const totalPages = pageFlip ? pageFlip.getPageCount() : 0;
    pageIndicator.innerText = `Página ${pageNum} de ${totalPages}`;

    const currentText = pdfPagesText[pageNum - 1] || 'Sin contenido de texto.';
    pageTextContent.innerText = currentText;

    // Lector de pantalla
    screenReaderAnnounce.innerText = `Página ${pageNum}. ${currentText}`;
}

// Control de Lectura en Voz Alta (TTS)
function speakCurrentPage() {
    stopSpeech();

    const currentPage = pageFlip ? pageFlip.getCurrentPageIndex() : 0;
    const textToRead = pdfPagesText[currentPage];

    if (!textToRead) return;

    speechUtterance = new SpeechSynthesisUtterance(textToRead);
    speechUtterance.lang = 'es-ES'; // Configuración de idioma español
    speechUtterance.rate = 0.95; // Velocidad ligeramente pausada para comprensión escolar

    speechUtterance.onstart = () => {
        btnTts.style.display = 'none';
        btnStopTts.style.display = 'inline-block';
    };

    speechUtterance.onend = () => {
        btnTts.style.display = 'inline-block';
        btnStopTts.style.display = 'none';
    };

    speechUtterance.onerror = () => {
        btnTts.style.display = 'inline-block';
        btnStopTts.style.display = 'none';
    };

    window.speechSynthesis.speak(speechUtterance);
}

function stopSpeech() {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    btnTts.style.display = 'inline-block';
    btnStopTts.style.display = 'none';
}

// Eventos de botones
btnNext.addEventListener('click', () => {
    if (pageFlip) pageFlip.flipNext();
});

btnPrev.addEventListener('click', () => {
    if (pageFlip) pageFlip.flipPrev();
});

btnTts.addEventListener('click', speakCurrentPage);
btnStopTts.addEventListener('click', stopSpeech);

// Botones de ajuste de tamaño de letra (A+ / A-)
btnFontIncrease.addEventListener('click', () => {
    if (currentFontSizeRem < 2.2) {
        currentFontSizeRem += 0.15;
        document.documentElement.style.setProperty('--font-scale', `${currentFontSizeRem}rem`);
    }
});

btnFontDecrease.addEventListener('click', () => {
    if (currentFontSizeRem > 0.75) {
        currentFontSizeRem -= 0.15;
        document.documentElement.style.setProperty('--font-scale', `${currentFontSizeRem}rem`);
    }
});