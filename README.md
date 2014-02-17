list-swap
=========

This is a short program to provide organizations with the ability to
share lists of e-mail addresses for list chaperones or swaps. It
allows you to combine your list with those of another organization
without sharing the actual content of the list.

Download Notes
--------------

This project uses submodules, which Github does not automatically
download. Until this is fixed, make sure to either `git submodule
update --init` after cloning, or download the [FileSaver.js][1]
project and place it into the content/FileSaver directory if you
downloaded the ZIP file.

Background
----------

The problem is straightforward: when performing a [list chaperone][2]
with another organization, you'd like to avoid sending the message to
recipients who are already on your list. However, you cannot simply
send your list to them to exclude. Instead, you can send a
cryptographic hash of each recipient's address. These hashes are
perfect for the job: each distinct address will map to a specific
output value, but the process is one-way, so someone in possession of
the output hash will be unable to determine what address is associated
with it. There is one exception: since the hashing process will
always give the same result for the same input, your partner
organization can create hashes of all of their addresses as well. Any
matches among the hashed output mean that the associated addresses are
on both lists, and should be excluded from the list chaperone.

Compatibility
-------------

This program is implemented in HTML and JavaScript. It requires
nothing more than a web browser, and should work fine in Internet
Explorer 10, Chrome 6, and FireFox 20 and more recent versions. It
also should work in Safari 6.1, though it will open a new tab rather
than directly downloading the final output.


Usage
-----

Start by downloading the program, and extract the contents of the
archive. (See above to make sure you've got the right submodules.)
Open the list-swap.html file. If you receive a warning about missing
JavaScript features, you should switch to a different web browser and
open the list-swap.html file directly from that browser.

If you're just starting this process, you'll want to begin by choosing
`Create hashes of my e-mail list`. On the next page, select the file
containing your e-mail addresses. This file must be a CSV file; Excel,
fixed-width, and tab-separated files are not supported at this time.

Once you've selected your file, you can set options for how the
program should handle your addresses as it processes them. You should
generally make sure that you and your partner organization use the
same settings, or else none of your addresses will match. Some
settings, like which fields to include, will be specific to your own
input file. Once that's done, start the hashing process.

When hashing is complete, you can preview the results (if you've
gotten sample records and you'd like to make sure they match) and save
the output file to your computer.

This tool does not currently allow you to compare your output file to
one you receive from someone else, but it will in the next version.

FAQ
---

######This uses my web browser. Am I uploading my list to your server, or somewhere on the internet?

No. While this program does run in a web browser, it does all of its
processing locally. This makes it easy to support all operating
systems. None of your data leaves your computer.

######Is it better to use upper or lower case / MD5 or SHA1?

The choice of these two does not matter. What is important is that you
use the same settings as anyone else who would be comparing the output
of this program.

Roadmap
-------

The following are intended enhancements for this program:

* Interface cleanup and improvements
* Add compare functionality to let you get the final suppression or
  mailing list based on output from this program



[1]: https://github.com/eligrey/FileSaver.js
[2]: http://www.mrss.com/lab/how-cross-promotions-can-help-your-organization/