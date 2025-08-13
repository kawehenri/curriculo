document.addEventListener('DOMContentLoaded', function() {
	const btnDownload = document.querySelector('.btn-download');
	if (btnDownload) {
		btnDownload.addEventListener('click', function() {
			btnDownload.classList.add('clicked');
			setTimeout(() => btnDownload.classList.remove('clicked'), 600);
		});
	}

	// Scroll suave para seções
	document.querySelectorAll('nav a').forEach(link => {
		link.addEventListener('click', function(e) {
			const href = link.getAttribute('href');
			if (href.startsWith('#')) {
				e.preventDefault();
				document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
			}
		});
	});
});
