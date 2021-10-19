/**
* @package     typingTest 
* @author      Karan Arora <github.com/karan36k>
* @version     1.0.0
* @license     under MIT <https://github.com/karan36k/typingTest/blob/master/LICENSE>
* @copyright   © 2020 karan36k. All rights reserved.
* @see         <github.com/typingTest>
* 
*/

// Shorthand for querySelectors
const select    = e => document.querySelector(e);
const selectAll = e => document.querySelectorAll(e);

// DOM elements 
const input         = select('#textInput');
const output        = select('#textOutput');
const inputFull     = select('#textFull');
// Counters
const _timer        = select('#timer');
const _wpm          = select('#wpm');
const _cpm          = select('#cpm');
const _errors       = select('#errors');
const _accuracy     = select('#accuracy');
const _totalWords   = select('#totalWords');
const _writtenWords = select('#writtenWords');
// Modal
const modal         = select('#ModalCenter');
const modalBody     = select('.modal-body');
const modalClose    = selectAll('.modal-close');
const modalReload   = select('#modalReload');
// Control btns
const btnPaly       = select('#btnPlay');
const btnRefresh    = select('#btnRefresh');
// Key sound 
const soundOn       = select('.icon-sound-on');
const soundOff      = select('.icon-sound-off');
const keyClick      = select('#keyClick');
const keyBeep       = select('#keyBeep');

let sound = true;
soundOn.addEventListener('click', e => {
    e.currentTarget.classList.add('d-none');
    soundOff.classList.remove('d-none');
    sound = false;
})

soundOff.addEventListener('click', e => {
    e.currentTarget.classList.add('d-none');
    soundOn.classList.remove('d-none');
    sound = true;
})

// Array will hold all quotes that stored in external JSON file
const allQuotes = [];
// Fetch that JSON file for data
fetch('js/quotes.json')
    .then(response => response.json())
    .then(data => allQuotes.push(...data))
    .catch(error => console.error('Error:', error));

// Function to return random key from an array
const random = array => array[Math.floor(Math.random() * array.length)];

// speedTyping Class
class speedTyping {

    constructor() {
        this.index          = 0;        // Main index
        this.words          = 0;        // Completed words index
        this.errorIndex     = 0;        // Errors index
        this.correctIndex   = 0;        // Correct index
        this.accuracyIndex  = 0;        // Accuracy counter
        this.cpm            = 0;        // CPM counter
        this.wpm            = 0;        // WPM cpm / 5 
        this.interval       = null;     // interval counter
        this.duration       = 60        // Test duration time (60 seconds)
        this.typing         = false;    // To check if we are typing
        this.quote          = [];       // Quotes array
        this.author         = [];       // Authors array
    }
    
    // Set the timer based on local time
    timer() {
        // Check first if its not running, Note that we set it to null
        if (typeof (this.interval) === 'number')
            return;

        // Timestamp in millisecond
        const now = Date.now();
        // Seconds when the test duration is done (60 seconds) converted to millisecond
        const done = now + this.duration * 1000;
        // Display the timer before interval run
        _timer.innerHTML = `${this.duration}<span class="small">s</span>`;
        // Set interval
        this.interval = setInterval(() => {
            // Get seconds left. Note that we ran Date.now() again to update the time
            const secondsLeft = Math.round((done - Date.now()) / 1000);
            // Display the timer in DOM again 
            _timer.innerHTML = `${secondsLeft}<span class="small">s</span>`;
            // Stop when reach 0 and call finish function
            if (secondsLeft === 0) {
                this.stop();
                this.finish();
            }
        }, 1000);
    }

    // Start typing function when run when Start button clicked
    start() {
        
        // Filter out not 'easy' quotes. Later we could make difficulty levels?
        const filterdQuotes = allQuotes.filter(item => item.level !== 'Easy');
        // Get Authors / Quotes only
        const getQuote  = filterdQuotes.map(item => item.quote);
        const getAuthor = filterdQuotes.map(item => item.author);
        
        // Get random author quotes
        this.author = random(getAuthor);
        // Get random quotes
        this.quote  = random(getQuote);
        // Count how many words in a single quote by splitting the array by whitespaces
        const quoteWords = this.quote.split(' ').filter(i => i).length;
        // Display total words counter
        _totalWords.textContent = quoteWords;

        // Set the timer 
        this.timer();
        // Set active class to Play btn
        btnPlay.classList.add('active');
        // Enable the typing area 
        input.setAttribute('tabindex', '0');
        input.removeAttribute('disabled');
        // Add set focus and Active class
        input.focus();
        input.classList.add('active');

        // Check if we start typing
        if (!this.typing) {
            this.typing = true;

            // Display the quotes in the input div
            input.textContent = this.quote;

            // Start the event listener
            input.addEventListener('keypress', event => {
                // Prevent the default action 
                event.preventDefault();
                // Just in case
                event = event || window.event;
                // Get the pressed key code
                const charCode = event.which || event.keyCode;
                // Read it as a normal key
                const charTyped = String.fromCharCode(charCode);
                // Compare the pressed key to the quote letter
                if (charTyped === this.quote.charAt(this.index)) {
                    // Detect the spaces by white space " "  or key code is (32) - Double check maybe not necessarily 
                    if (charTyped === " " && charCode === 32) {
                        this.words++;
                        // Display the written words
                        _writtenWords.textContent = this.words;
                    }
                    // Increment the keys index
                    this.index++;
                    
                    // Hold current quote
                    const currentQuote = this.quote.substring(this.index, this.index + this.quote.length);
       
                    // Update the input div value when typing
                    input.textContent = currentQuote;
                    output.innerHTML += charTyped;
                    // Increment the correct keys
                    this.correctIndex++;
                    // If index = the quote length, that means the text is done, call the finish() method
                    if (this.index === this.quote.length) {
                        this.stop();
                        this.finish();
                        return;
                    }
                    // Play typing sound if enabled
                    if (sound) {
                        keyClick.currentTime = 0;
                        keyClick.play();
                    }
                } else {
                    // Add the errors into the output div 
                    output.innerHTML += `<span class="text-danger">${charTyped}</span>`;
                    // Increment the wrong keys counter
                    this.errorIndex++;
                    // Add accuracy error counter to the dom
                    _errors.textContent = this.errorIndex;
                    // Decrement the correct keys counter
                    this.correctIndex--;
                    // Play typing sound if enabled
                    if (sound) {
                        keyBeep.currentTime = 0;
                        keyBeep.play();
                    }
                }
                //const rawcpm  = Math.floor(this.index / this.seconds * 60);
                // CPM counter
                this.cpm = this.correctIndex > 5 ? Math.floor(this.correctIndex / this.duration * 60) : 0;
                // Add to the dom
                _cpm.textContent = this.cpm;
                // WPM: (correct chars / total time * 60 / 5)
                this.wpm = Math.round(this.cpm / 5);
                _wpm.textContent = this.wpm;
                // Accuracy: (Correct chars * 100 / total index)
                this.accuracyIndex = this.correctIndex > 5 ? Math.round((this.correctIndex * 100) / this.index) : 0;
                // Add accuracy to the dom. We need to check it because division by 0 give us a special values (infinity, NaN)
                if (this.accuracyIndex > 0 && Number.isInteger(this.accuracyIndex)) 
                    _accuracy.innerHTML = `${this.accuracyIndex}<span class="small">%</span>`;

            });
        }
    }
    // Stop the timer
    stop() {
        // Clear timer and set interval to null
        clearInterval(this.interval);
        this.interval = null;
        // Just to be sure
        this.typing = false;
        // Reset The Timer value to 0
        _timer.textContent = '0';
        // Remove the start btn 
        btnPaly.remove();
        // Remove the input area
        input.remove();
        // Set active class to Refresh btn
        btnRefresh.classList.add('active');
        // Show the full quote in the hidden div
        inputFull.classList.remove('d-none');
        // Show the tested quote
        inputFull.innerHTML = `&#8220;${this.quote}&#8221; <span class="d-block small text-muted text-right pr-3">&ndash; ${this.author}</span></div> `;
        // Completely stop
        return;
    }

    // Last action
    finish() {
        // Show the modal
        modal.style.display = 'block';
        const wpm = this.wpm;
        let result = '';
        const message = `Your typing speed is <strong>${wpm}</strong> WPM which equals <strong>${this.cpm}</strong> CPM. You've made a <strong>${this.errorIndex}</strong> mistakes with <strong>${this.accuracyIndex}%</strong> total accuracy.`;

        if (wpm > 5 && wpm < 20) {
            result = `
                <div class="modal-icon my-3"><img src="img/sleeping.svg" class="media-object"></div>
                <div class="media-body p-2">
                    <h4 class="media-heading">So Slow!</h4>
                    <p class="lead pt-2">${message} You should do more practice!</p>
                </div>`
        } else if (wpm > 20 && wpm < 40) {
            result = `
                <div class="modal-icon my-3"><img src="img/thinking.svg" class="media-object"></div>
                <div class="media-body p-2">
                    <h4 class="media-heading">About Average!</h4>
                    <p class="lead pt-2">${message} You can do better!</p>
                </div>`
        } else if (wpm > 40 && wpm < 60) {
            result = `
                <div class="modal-icon my-3"><img src="img/surprised.svg" class="media-object"></div>
                <div class="media-body p-2">
                    <h4 class="media-heading">Great Job!</h4>
                    <p class="lead pt-2">${message} You're doing great!</p>
                </div>`
        } else if (wpm > 60) {
            result = `
                <div class="modal-icon my-3"><img src="img/shocked.svg" class="media-object"></div>
                <div class="media-body p-2">
                    <h4 class="media-heading">Insane!</h4>
                    <p class="lead pt-2">${message} You're are Awesome!</p>
                </div>`
        } else {
            result = `
                <div class="modal-icon my-3"><img src="img/smart.svg" class="media-object"></div>
                <div class="media-body p-2">
                    <h4 class="media-heading">Hmmm!</h4>
                    <p class="lead pt-2">Please stop playing around and start typing!</p>
                </div>`
        }

        // Update the DOM
        modalBody.innerHTML = result;
        // Target all modal close buttons
        modalClose.forEach(btn => btn.addEventListener('click', () => modal.style.display = 'none'));
        // Also close the modal when user clicks outside
        window.addEventListener('click', e => e.target === modal ? modal.style.display = 'none' : '');
        // Repeat the test btn
        modalReload.addEventListener('click', () => location.reload());
        // Save the wpm values values to localStorage        
        localStorage.setItem('WPM', wpm);
    }
}
// Init the class
const typingTest = new speedTyping();

// Start the test when Start btn clicked
btnPaly.addEventListener('click', () => typingTest.start());
// Reload the page when Refresh btn is clicked
btnRefresh.addEventListener('click', () => location.reload());

// Save last wpm result to Local storage
const savedWPM = localStorage.getItem('WPM') || 0;
select('#result').innerHTML = `<li>${savedWPM}</li>`;