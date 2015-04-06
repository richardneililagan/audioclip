---
layout : "landing"
stylesheets :
  - landing.css
---

{{ site.meta.name }}
===

## {{ site.meta.description }}

Create audioclip play functions from your remote sound files.

{% highlight javascript linenos %}
var snare = audioclip ('/path/to/your/awesome/snare/clip.mp3');

// :: boom, clap!
snare();
{% endhighlight %}

<button class="o-demo-play-01 -noted button-primary">
Awesome for event handlers.
</button>

<script>
jQuery(function ($) {

  var audiofile =
    Modernizr.audio.ogg ? 'snare.ogg' :
    Modernizr.audio.mp3 ? 'snare.mp3' :
    Modernizr.audio.wav ? 'snare.wav' : ''
    ;

  var demobutton = $('.o-demo-play-01');

  if (!!audiofile) {
    var snare = audioclip(['assets','audio', audiofile].join('/'));
    demobutton.on('click', function () {
      snare();
    });
  }
  else {
    demobutton.text('Your browser does not support HTML 5 Audio.');
  }

});
</script>


### Timing and Scheduling

Specify how long to skip, how long to play, and how long to wait before playing any clip.

{% highlight javascript linenos %}
var boombass = audioclip('/boombass.ogg');
boombass(delay, offset, duration);
{% endhighlight %}

<div class="o-demo-play-02 row">
  <div class="three columns">&nbsp;</div>
  <div class="-range two columns">
    <h4><span>2.00</span><small>seconds</small></h4>
    <input type="range" data-range="delay" min="0" max="4" />
    <label>Delay</label>
  </div>
  <div class="-range two columns">
    <h4><span>2.00</span><small>seconds</small></h4>
    <input type="range" data-range="offset" min="0" max="4" />
    <label>Offset</label>
  </div>
  <div class="-range two columns">
    <h4><span>2.00</span><small>seconds</small></h4>
    <input type="range" data-range="duration" min="0" max="4" />
    <label>Duration</label>
  </div>
  <div class="three columns">&nbsp;</div>
  <div class="twelve columns">
    <button class="button-primary -noted">
      Guitar Solo!
    </button>
  </div>
</div>

<script>
jQuery(function ($) {
  var ranges = $('.o-demo-play-02 input[type=range]')
    .each(function () {
      var range = $(this);
      range.data('label', range.prev('h4').find('span'));
    })
    .on('input', function () {

      var range = $(this);
      var time = range.val();

      $(this).data('label').text(time.toFixed(2));
    });

  var guitar = audioclip('assets/audio/guitar-fmajor.mp3');
  $('.o-demo-play-02 .button-primary')
    .on('click', function () {

      var delay = ranges.eq(0).val();
      var offset = ranges.eq(1).val();
      var duration = ranges.eq(2).val();

      guitar(delay,offset,duration);
    });
});
</script>