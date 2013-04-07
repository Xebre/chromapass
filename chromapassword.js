/**
 * Replace the given input with a ChromaPassword widget
 *
 * - Original input is kept, and receives the input, but is hidden from view
 * 
 * requires a sha1() hash function
 */
function ChromaPassword(input)
{
	var self = this;
	
	/**
	 * Store the salt - Adds some extra security to prevent people just trial-and-error'ing
	 */
	self.salt = 'change_me_using_setSalt()';
	
	/**
	 * Store the currently chroma-fied chars and blocks
	 */
	self.chars  = [];
	self.blocks = [];
	
	/**
	 * Update the chroma-fied value
	 */ 
	self.update = function(strvalue)
	{
		// Find the difference between the new value and the last one
		value = strvalue.split('');
		lastvalue = self.chars;
		
		var i = 0;
		while(i < value.length || i < lastvalue.length)
		{
			// If the old value is exhausted, there are just blocks to add
			if(typeof lastvalue[i] == 'undefined')
			{
				self.add(value.splice(i, value.length - i));
				break;
			}
			// If new value is exhausted, we need to remove some blocks
			else if(typeof value[i] == 'undefined')
			{
				self.remove(lastvalue.length - i);
				break;
			}
			// If lastvalue is not the same as new value, remove blocks and add what remains
			else if(lastvalue[i] != value[i])
			{
				self.remove(lastvalue.length);
				self.add(value.splice(i, value.length - i));
				break;
			}
			
			i++;
		}
	}
	
	/**
	 * Remove num blocks
	 */
	self.remove = function(num)
	{
		var i = 0;
		while(i < num && self.chars.length > 0)
		{
			var removed = self.chars.pop(); // Remove character from buffer
			
			self.element.removeChild(self.blocks.pop()); // Remove block
			
			i++;
		}
	}
	
	/**
	 * Add the given chars as new blocks
	 */
	self.add = function(chars)
	{
		for(var i in chars)
		{
			self.chars.push(chars[i]);
			
			var block = document.createElement('span');
			
			self.blocks.push(block);
			block.style.background = self.tripletToHex(self.scaleTriplet(self.getColour(self.chars.length - 1)));
			
			self.element.appendChild(block);
		}
	}
	
	/**
	 * Set the salt - This could be a username/userid
	 */
	self.setSalt = function(salt)
	{
		self.salt = salt;
		
		var setBlock = function(blocknum, triplet)
		{
			// This shouldn't really go here, but it makes changing the salt easier!
			self.blocks[blocknum].style.background = self.tripletToHex(self.scaleTriplet(triplet));
		}
		
		if(self.blocks.length > 0)
			self.getColour(self.blocks.length - 1, setBlock);
	}
	
	/**
	 * Get the colour for the next block
	 */
	self.pad = function(str)
	{
		while(str.length < 2)
		{
			str = '0' + new String(str);
		}
		
		return str;
	}
	
	/**
	 * A callback may be provided to intercept each colour as it's calculated to eg set multiple
	 * blocks at once without being too inefficient (colours are calculated recursively)
	 */
	var pweight = 0.8; // Weight given to previous colour
	self.getColour = function(blocknum, callback)
	{	
		var char = self.chars[blocknum];
		
		// Concat salt with existing chars and sha1 hash		
		hash = sha1(self.salt + self.chars.slice(0,blocknum).join('') + char);
		
		// Recursive colouring - Offset from the previous one to give a nicer set
		var r, g, b;
		
		// Use first 6 chars as colour code
		r = parseInt(hash.substr(0,2), 16);
		g = parseInt(hash.substr(2,2), 16);
		b = parseInt(hash.substr(4,2), 16);
		
		console.log("From hash: ", r, g, b);
		
		if(blocknum > 0)
		{
			var p = self.getColour(blocknum-1);
			
			// Take a weighted average of the old colour and the new one
			r = (p.r*pweight + r) / (pweight+1);
			g = (p.g*pweight + g) / (pweight+1);
			b = (p.b*pweight + b) / (pweight+1);
			
			console.log("Weighted: ", r, g, b);
		}
		
		// Make the colour more vivid by adding 25% to highest component and reducing the other two
		if(r > g && r > b)
		{
			r = Math.min(r * 1.25, 255);
			g = g * 0.8;
			b = b * 0.8;
		}
		
		if(g > r && g > b)
		{
			g = Math.min(g * 1.25, 255);
			r = r * 0.8;
			b = b * 0.8;
		}
		
		if(b > g && b > r)
		{
			b = Math.min(b * 1.25, 255);
			g = g * 0.8;
			r = r * 0.8;
		}
		
		
		var triplet = {r: Math.round(r), g: Math.round(g), b: Math.round(b)};
		
		console.log(triplet);
		
		if(callback != undefined)
		{
			callback(blocknum, triplet);
		}
		
		return triplet;
	}
	
	self.tripletToHex = function(triplet)
	{
		var out = '#' + self.pad(Math.round(triplet.r).toString(16)) + self.pad(Math.round(triplet.g).toString(16)) + self.pad(Math.round(triplet.b).toString(16));
	
		console.log(triplet, out);
		
		return out;
	}
	
	// "Scale" a triplet by moving each component into a range
	self.rmax = 255;
	self.rmin = 0;
	self.gmax = 255;
	self.gmin = 0;
	self.bmax = 255;
	self.bmin = 0;
	
	self.scaleTriplet = function(triplet)
	{
		var rscale = (self.rmax - self.rmin) / 255;
		var gscale = (self.gmax - self.gmin) / 255;
		var bscale = (self.bmax - self.bmin) / 255;
		
		console.log("Scale:", triplet);
		
		triplet.r = triplet.r * rscale + self.rmin;
		triplet.g = triplet.g * gscale + self.gmin;
		triplet.b = triplet.b * bscale + self.bmin;
		
		console.log("Scaled:", triplet);
		
		return triplet;
	}
	
	self.hexToTriplet = function(hex)
	{
		var pr, pg, pb;
		
		pr = parseInt(hex.substr(1,2), 16);
		pg = parseInt(hex.substr(3,2), 16);
		pb = parseInt(hex.substr(5,2), 16);
		
		return {r: pr, g: pg, b: pb};
	}
	
	/**
	 * SETUP
	 */
	
	// Add new element
	
	self.element = document.createElement('div');
	input.parentNode.insertBefore(self.element, input);
	self.element.appendChild(input);
	
	self.element.style.position = 'relative';
	input.style.position = 'absolute';
	input.style.top = '0';
	input.style.left = '0';
	
	// Focus the real input when the fake input is clicked
	self.element.onclick = function(){input.focus()};
	self.element.className = 'chromapassword'; // Add a class so the fake element can be styled!
	
	
	// Detect keypress and change on real input, trigger update
	var doUpdate = function(){self.update(input.value)};
	input.onkeyup = doUpdate;
	input.onchange = doUpdate;
}
