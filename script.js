let stream = null,
    audio = null,
    mixedStream = null,
    chunks = [],
    recorder = null,
    startBtn = null,
    stopBtn = null,
    downloadBtn = null,
    recordedVdo = null;


async function setUpStream() {
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: true
        });
        audio = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });

        setupVideoFeedback();
    } catch (error) {
        console.error(error);
    }
}


function setupVideoFeedback() {
    if (stream) {
        const video = document.querySelector('.video-feedback');
        video.srcObject = stream;
        video.play();
    } else {
        console.warn('No stream available');
    }
}

async function startRecording() {
    await setUpStream();

    if (stream && audio) {
        mixedStream = new MediaStream([
            ...stream.getTracks(),
            ...audio.getTracks()
        ]);

        recorder = new MediaRecorder(mixedStream);
        recorder.ondataavailable = handleDataAvailable;
        recorder.onstop = handleStop;
        recorder.start(200);

        startBtn.disabled = true;
        stopBtn.disabled = false;

        console.log('Recording has Starded :)');
    } else {
        console.warn('No Stream Available');

    }
}

function handleDataAvailable(e) {
    chunks.push(e.data);
}

function stopRecording() {
    recorder.stop();

    startBtn.disabled = false;
    stopBtn.disabled = true;

    console.log('Recording has Finished :)');
}

function handleStop(e) {
    const blob = new Blob(chunks, {
        type: 'video/mp4',
    })

    chunks = [];

    downloadBtn.href = URL.createObjectURL(blob);
    downloadBtn.download = 'video.mp4';
    downloadBtn.disabled = false;

    recordedVdo.src = URL.createObjectURL(blob);
    recordedVdo.load();
    recordedVdo.onloadeddata = () => {
        recordedVdo.play();

        const rc = document.querySelector('.recorded');
        rc.classList.remove('hidden');
        rc.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    stream.getTracks().forEach(track => {
        track.stop()
    });
    audio.getTracks().forEach(track => {
        track.stop()
    })

    console.log('Recording has been saved :)');

}


window.addEventListener('load', () => {
    startBtn = document.querySelector('.startBtn');
    stopBtn = document.querySelector('.stopBtn');
    downloadBtn = document.querySelector('.downloadBtn');
    recordedVdo = document.querySelector('.video-recorded');

    startBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
})