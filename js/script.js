// script.js

// Functions
function startReading() {
    window.location.href = 'home.html';
     // window.location.href = 'chapters.html';
}

function goToChapter(chapterUrl) {
    window.location.href = chapterUrl;
}

function goToHome() {
   // window.location.href = '../home.html';
   // window.location.href = '../index.html';
      window.location.href = '../chapters.html';
}

function goToMainHome() {
    window.location.href = '../home.html';
   // window.location.href = '../index.html';
   //	  window.location.href = '../chapters.html';
}


function goToHomePage() {
     window.location.href = 'index.html';
}

function goToIndexPage() {
     window.location.href = '../index.html';
}

function goToRegistrationHomePage() {
     window.location.href = '../registrations.html';
}

function goToNityaPathHome() {
     window.location.href = '../nityapathhome.html';
}

// Chapter Next Previous link for All Nitya Stotra 31052025
function goToAnnapurnaHome() {
     window.location.href = 'annapurna-stotra.html';
}
function goToAtharvashirshaHome() {
     window.location.href = 'ganapati-atharvashirsha.html';
}
function goToDeviAshtakHome() {
     window.location.href = 'devi-ashtak.html';
}
function goToLakshmiStotraHome() {
     window.location.href = 'lakshmi-stotra.html   ';
}
function goToShreesuktaHome() {
     window.location.href = 'shreesukta.html';
}
function goToMahishasurmardiniHome() {
     window.location.href = 'mahishasurmardini.html ';
}
function goToDnyaneshwariHome() {
     window.location.href = 'dnyaneshwari.html';
}
function goToDurgaStotraHome() {
     window.location.href = 'durga-stotra.html';
}
function goToMohinirajStotraHome() {
     window.location.href = 'mohiniraj-stotra.html';
}
function goToShivTandavStotraHome() {
     window.location.href = 'shiv-tandav-stotra.html';
}
function goToGhoraKashtodharanaHome() {
     window.location.href = 'ghora-kashtodharana.html  ';
}
function goToDattaBhavsudharasaHome() {
     window.location.href = 'datta-bhavsudharasa.html';
}
function goToMarutiStotraHome() {
     window.location.href = 'marutistotra.html';
}
function goToHanumanChalisaHome() {
     window.location.href = 'hanumanchalisa.html';
}

// Chapter Next Previous link for Navratri Aarti 20092025

function goToNavratriAartiHome() {
     window.location.href = '../navratri-aarti.html';
}
function goToNavratriAartiPage1() {
     window.location.href = 'navaratri-aarti1.html';
}
function goToNavratriAartiPage2() {
     window.location.href = 'navaratri-aarti2.html';
}
function goToNavratriAartiPage3() {
     window.location.href = 'navaratri-aarti3.html';
}
function goToNavratriAartiPage4() {
     window.location.href = 'navaratri-aarti4.html';
}
function goToNavratriAartiPage5() {
     window.location.href = 'navaratri-aarti5.html';
}
function goToNavratriAartiPage6() {
     window.location.href = 'navaratri-aarti6.html';
}
function goToNavratriAartiPage7() {
     window.location.href = 'navaratri-aarti7.html';
}
function goToNavratriAartiPage8() {
     window.location.href = 'navaratri-aarti8.html';
}
function goToNavratriAartiPage9() {
     window.location.href = 'navaratri-aarti9.html';
}
function goToNavratriAartiPage10() {
     window.location.href = 'navaratri-aarti10.html';
}
function goToNavratriAartiPage11() {
     window.location.href = 'navaratri-aarti11.html';
}
function goToNavratriAartiPage12() {
     window.location.href = 'navaratri-aarti12.html';
}
function goToNavratriAartiPage13() {
     window.location.href = 'navaratri-aarti13.html';
}
function goToNavratriAartiPage14() {
     window.location.href = 'navaratri-aarti14.html';
}

// JavaScript to disable right-click context menu globally and on a specific section
document.addEventListener('DOMContentLoaded', function() {
    // Disable right-click context menu globally
    document.body.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Disable right-click context menu on a specific section
    const sectionElement = document.getElementById('youDivSectionId');
    if (sectionElement) {
        sectionElement.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    }
    
    // Disable cut, copy, and paste actions
    document.addEventListener('cut', function(e) {
        e.preventDefault();
    });
    document.addEventListener('copy', function(e) {
        e.preventDefault();
    });
    document.addEventListener('paste', function(e) {
        e.preventDefault();
    });

    // Disable certain key combinations
    document.addEventListener('keydown', function(event) {
        // Disable F12 (Developer Tools)
        if (event.keyCode === 123) {
            event.preventDefault();
        }
        // Disable Ctrl+U (View Page Source), Ctrl+A (Select All), Ctrl+S (Save)
        if (event.ctrlKey && (event.keyCode === 85 || event.keyCode === 83 || event.keyCode === 65)) {
            event.preventDefault();
        }
        // Disable Ctrl+Shift+I (Developer Tools)
        if (event.ctrlKey && event.shiftKey && event.keyCode === 73) {
            event.preventDefault();
        }
        // Disable Ctrl+P (Print)
        if (event.ctrlKey && event.keyCode === 80) {
            event.preventDefault();
        }
        // Disable Ctrl+V (Paste)
        if (event.ctrlKey && event.keyCode === 86) {
            event.preventDefault();
        }
    });
});


// Get all audio elements for Audio Gallery
const audioElements = document.querySelectorAll('audio');
// Add event listener for each audio element
audioElements.forEach(audio => {
    audio.addEventListener('play', () => {
        // Pause all other audio elements
        audioElements.forEach(otherAudio => {
            if (otherAudio !== audio) {
                otherAudio.pause();
            }
        });
    });
});

// Get all Video elements for Video Gallery
var currentlyPlaying;

function onYouTubeIframeAPIReady() {
    // Initialize video players
    var videos = document.querySelectorAll('.youtube-video');
    
    videos.forEach(function(video) {
        var videoId = video.getAttribute('data-video-id');
        new YT.Player(video.id, {
            height: '450',
            width: '640',
            videoId: videoId,
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    });

    // Initialize playlists
    var playlists = document.querySelectorAll('.youtube-playlist');
    playlists.forEach(function(playlist) {
        var playlistId = playlist.getAttribute('data-playlist-id');
        new YT.Player(playlist.id, {
            height: '450',
            width: '1542',
            playerVars: {
                list: playlistId
            },
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        if (currentlyPlaying && currentlyPlaying !== event.target) {
            currentlyPlaying.pauseVideo(); // Pause the currently playing video
        }
        currentlyPlaying = event.target; // Update currentlyPlaying to the new video
    } else if (event.data === YT.PlayerState.ENDED) {
        currentlyPlaying = null; // Reset when video ends
    }
}
