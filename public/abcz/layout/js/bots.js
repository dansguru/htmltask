document.querySelectorAll('.bot-card').forEach(card => {
    card.addEventListener('click', () => {
        const title = card.querySelector('.bot-title').textContent;
        console.log(`Clicked bot: ${title}`);
        
        // Simulate clicking the AI Bots tab in the navbar
        const navbar = document.getElementById('navbar');
        if (navbar) {
          const aiTab = Array.from(navbar.querySelectorAll('.nav-item'))
            .find(el => el.textContent.includes('AI Bots'));

          if (aiTab) {
            aiTab.click();
          }
        }
    });
});