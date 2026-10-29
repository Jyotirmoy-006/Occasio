// Strict CSSOM-based calm, continuous animation for Cold Open (S0)
// Timed frame-accurately to narration:
// 0.15s: "How many tabs does it take to plan a wedding?" -> tabs fan out dynamically from center
// 1.80s: "A budget spreadsheet" -> Tab 0 highlights (gold border + lift)
// 2.80s: "a checklist" -> Tab 2 highlights
// 3.80s: "a thread of vendor emails" -> Tabs 1 and 3 highlight
// 5.00s: "and a deadline you forgot" -> Tab 4 highlights alert coral
// 5.90s: smooth slide convergence into deck
// 6.70s: collapse into wax seal monogram
// 7.10s: wax seal stamp + golden ripple ring expansion
// 7.80s: golden seal pulse leading to S1 cut
document.addEventListener('DOMContentLoaded', () => {
  const tabs = [
    { el: document.getElementById('tab-0'), target: 'translate(-330px, -25px) rotate(-5deg)' },
    { el: document.getElementById('tab-1'), target: 'translate(-165px, 20px) rotate(3deg)' },
    { el: document.getElementById('tab-2'), target: 'translate(0px, -10px) rotate(-2deg)' },
    { el: document.getElementById('tab-3'), target: 'translate(165px, 22px) rotate(4deg)' },
    { el: document.getElementById('tab-4'), target: 'translate(330px, -18px) rotate(-4deg)' },
  ];

  const monogram = document.getElementById('monogram-target');
  const ring = document.getElementById('monogram-ring');

  // Step 1: Initial clustered state (0.0s)
  tabs.forEach(({ el }, idx) => {
    if (el) {
      el.style.transform = `translate(${(idx - 2) * 20}px, 15px) scale(0.92)`;
      el.style.opacity = '0.7';
      el.style.transition = 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.6s ease, border-color 0.4s ease, box-shadow 0.4s ease';
    }
  });

  // Dynamic fan-out as "How many tabs does it take to plan a wedding?" is spoken (0.15s - 1.5s)
  setTimeout(() => {
    tabs.forEach(({ el, target }) => {
      if (el) {
        el.style.transform = target;
        el.style.opacity = '1';
      }
    });
  }, 150);

  // Step 2: "A budget spreadsheet" highlight (1.8s)
  setTimeout(() => {
    if (tabs[0].el) {
      tabs[0].el.style.transform = 'translate(-330px, -34px) rotate(-4deg) scale(1.08)';
      tabs[0].el.style.borderColor = '#D9B65B';
      tabs[0].el.style.boxShadow = '0 12px 30px rgba(217, 182, 91, 0.45)';
    }
  }, 1800);

  // Step 3: "a checklist" highlight (2.8s)
  setTimeout(() => {
    if (tabs[2].el) {
      tabs[2].el.style.transform = 'translate(0px, -20px) rotate(-1deg) scale(1.08)';
      tabs[2].el.style.borderColor = '#D9B65B';
      tabs[2].el.style.boxShadow = '0 12px 30px rgba(217, 182, 91, 0.45)';
    }
  }, 2800);

  // Step 4: "a thread of vendor emails" highlight (3.8s)
  setTimeout(() => {
    if (tabs[1].el) {
      tabs[1].el.style.transform = 'translate(-165px, 10px) rotate(2deg) scale(1.08)';
      tabs[1].el.style.borderColor = '#D9B65B';
      tabs[1].el.style.boxShadow = '0 12px 30px rgba(217, 182, 91, 0.45)';
    }
    if (tabs[3].el) {
      tabs[3].el.style.transform = 'translate(165px, 12px) rotate(3deg) scale(1.08)';
      tabs[3].el.style.borderColor = '#D9B65B';
      tabs[3].el.style.boxShadow = '0 12px 30px rgba(217, 182, 91, 0.45)';
    }
  }, 3800);

  // Step 5: "and a deadline you forgot" (5.0s)
  setTimeout(() => {
    if (tabs[4].el) {
      tabs[4].el.style.transform = 'translate(330px, -26px) rotate(-6deg) scale(1.10)';
      tabs[4].el.style.borderColor = '#E05A47';
      tabs[4].el.style.boxShadow = '0 12px 30px rgba(224, 90, 71, 0.55)';
    }
  }, 5000);

  // Step 6: Slide together smoothly into stack (5.9s)
  setTimeout(() => {
    tabs.forEach(({ el }, idx) => {
      if (el) {
        const offset = (idx - 2) * 12;
        el.style.transform = `translate(${offset}px, ${offset * 0.4}px) rotate(${offset * 0.15}deg)`;
        el.style.borderColor = 'rgba(217, 182, 91, 0.8)';
        el.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
      }
    });
  }, 5900);

  // Step 7: Collapse stack into monogram (6.7s)
  setTimeout(() => {
    tabs.forEach(({ el }) => {
      if (el) {
        el.style.transform = 'translate(0px, 0px) scale(0.12)';
        el.style.opacity = '0';
      }
    });
  }, 6700);

  // Step 8: Expand wax monogram seal + glowing ripple ring (7.1s)
  setTimeout(() => {
    if (monogram) {
      monogram.style.transform = 'scale(1.15)';
      monogram.style.opacity = '1';
      monogram.classList.add('monogram-active');
      setTimeout(() => {
        monogram.style.transform = 'scale(1.0)';
      }, 300);
    }
    if (ring) {
      ring.classList.add('ripple-active');
    }
  }, 7100);

  // Step 9: Gentle pulse shimmer (7.7s)
  setTimeout(() => {
    if (monogram) {
      monogram.style.transform = 'scale(1.06)';
      monogram.style.boxShadow = '0 0 25px rgba(217, 182, 91, 0.6)';
    }
  }, 7700);
});
