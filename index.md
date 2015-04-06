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

lorem10
