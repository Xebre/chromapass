chromapass
==========

Colourful password input - Provide helpful feedback while typing passwords, without exposing the password in plain text.

The algorithm for determining what colour each block should be is a little more complex than just assiging a colour to each char.  It's based on the sha1 hash of the password string, and the colour of the previous block. This means that a) there's no 1-1 mapping between colour and character, b) it's relatively expensive to compute the colours, making brute-force attacks against colour chains harder and c) gives a good range of colours.

The input can be salted (using a username field, for example) to guard against rainbow-tables.

usage
-----

// Turn the given element into a chromaPass input
var cp = new ChromaPassword(document.getElementById('cpass'));

// Salt the string used to compute colours with the username
document.getElementById('username').onchange = function(){cp.setSalt(this.value);};
