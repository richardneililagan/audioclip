TEST UPDATE
===

audioclip
===

Quick and easy playing of audio for the web.

> TODO
>
> * Feature fallback for non-supported browsers (i.e. for <audio> shims)
> * Support for effect nodes (e.g. gain)
> * Looping plays
> * Stopping plays manually
> * Fallback support + detection for buffers created using standard HTML5 AudioBuffer
> * `AudioBuffer` and `AudioBufferEffector` seem redundant. Probably merge them into a single class.

## Usage

Create a playable audioclip by throwing a URL into the `audioclip()` function.

```javascript
// create a playable clip
var clip = audioclip('path/to/snare/clip.mp3');

// and play it by calling the function created
clip();  // boom!
```

### Basic timing, truncating, etc

The clip function allows for basic control over how the audio clip is played:

```javascript
// :: all arguments are optional ::
//
// time     --- how many seconds to wait before playing (default : 0)
// offset   --- how many seconds from the start of the audio clip
//              to start playing from (default : 0)
// duration --- how many seconds to play this audio clip (default : until end of clip)
//
clip(time, offset, duration);
```

Some examples :

```javascript
// play from start to end
clip();

// play after half a second
clip(0.5);

// play right away, but skip 1 sec of audio
clip(0, 1);

// play right away, skip 1 sec of audio, AND play only the next 1.5 seconds of audio
// i.e. play 0:00:01.00 - 0:00:02.50 of audio
clip(0, 1, 3/2);
```

### Synced playing of multiple audio clips

Multiple audio clips can be played by generating a play function
for each of your audio clips:

```javascript
var snare = audioclip('/snare.mp3');
var hihat = audioclip('/hihat.mp3');

snare();
hihat();
```

But to make things a bit simpler and more manageable, you can group audio clips
into _cabinets_. These form logical groupings of audio clips.

```javascript
var cabinet = audioclip.createCabinet();

var snareEffector = cabinet.clip('snare', snare);
var hihatEffector = cabinet.clip('hihat', hihat);

// alternatively :
// var snareEffector = cabinet.clip('snare', 'path/to/snare.mp3');
// var hihatEffector = cabinet.clip('hihat', 'path/to/hihat.mp3');

cabinet.play();
```

While this might not make a lot of sense when making sure clips play at the same time,
groupings clips into cabinets allow you to better schedule _when_ clips actually play.

```
hihatEffector.beat(0,1,2,3,4,5,6,7);
snareEffector.beat(2,6,7);

//
// hihat :: -X-X-X-X-X-X-X-X-
// snare :: -----X-------X-X-
//
cabinet.play();
```

`.beat()` takes in a _measure time_ value (i.e. half beat, whole beat), and
is dependent on a particular _bpm_ (beats per minute).

You can change a cabinet's _bpm_ by calling `cabinet.bpm(160);`.

When you call `cabinet.play()`, this _bpm_ is taken into account by
all clips registered to the `cabinet`.

Alternatively, you can also play a single `cabinet` clip by calling
its `.play(beat_time)` function as well (where `beat_time` defaults to `0.5 (sec)`, equivalent to `bpm === 120`).

```
cabinet.bpm(160);
cabinet.play();

// or play a single cabinet clip using a custom bpm
// :: this will take into account the cabinet clip's registered beats
snareEffector.play(60 / 216);   // 216 beats per 60 seconds
```

## Rock tune example

```javascript
var cabinet = audioclip.createCabinet();

// register clips and timings
cabinet.clip('hihat', 'hihat.mp3').beat(0, 1, 2, 3, 4, 5, 6, 7);
cabinet.clip('kick', 'kick.mp3').beat(0, 3/2, 7/2, 9/2, 11/2);
cabinet.clip('snare', 'snare.mp3').beat(2, 6);

// set bpm
cabinet.bpm(216);

// let's rock!
cabinet.play();

//
// hihat :: -X---X---X---X---X---X---X---X-
// snare :: ---------X---------------X-----
//  kick :: -X-----X-------X---X---X-------
```
