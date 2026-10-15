[index.html.html](https://github.com/user-attachments/files/33518306/index.html.html)
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visor de Cuentos PDF con Paginación</title>
    <link rel="stylesheet" href="style.css">
    <!-- Librería PDF.js para leer el PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
    <!-- Librería PageFlip para el efecto de pasar página -->
    <script src="https://cdn.jsdelivr.net/npm/page-flip/dist/js/page-flip.browser.js"></script>
</head>
<body>
    <header class="header">
        <h1>Lector de Cuentos</h1>
        <p>Sube tu cuento en formato PDF para visualizarlo como un libro real.</p>
        
        <nav class="nav-container">
            <div class="upload-container">
                <input type="file" id="pdf-upload" accept="application/pdf" />
                <label for="pdf-upload" class="upload-btn">Cargar PDF</label>
            </div>
            <!-- Declaratoria al final de la navegación -->
            <p class="iag-nav-notice">Este cuento fue creado por IAG</p>
        </nav>

        <div id="loading">Cargando y procesando páginas (esto puede demorar unos segundos)...</div>
    </header>

    <main class="book-container">
        <!-- El flipbook se generará aquí -->
        <div id="flip-book" class="flip-book"></div>
    </main>

    <!-- Pie de página con la declaratoria de imágenes -->
    <footer class="footer">
        <p class="iag-footer-notice">Las imágenes fueron creadas con la IA</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
