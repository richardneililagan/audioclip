'use strict';

jQuery(function ($) {

  $('[data-instrument]').each(function () {
    var self = $(this),
        instrument = self.data('instrument')
        ;

    self
      .on('click', 'button', function (event) {
        event.preventDefault();

        // :: essentially :
        //    var clip = audioclip(url/to/sound/file);
        //    clip();
        $(this).data('audioclip')();
      })
      .find('button').each(function () {

        var btn = $(this);
        var audiofile = ['assets/audio/', instrument, btn.text()].join('');

        // :: store the associated audioclip to the HTML element
        //    that will require it later.
        btn.data('audioclip', audioclip(audiofile));
      });

  });
});