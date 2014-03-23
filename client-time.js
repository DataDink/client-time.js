(function ($) {
    // data-time-format:    (required) The format describing how the time should be parsed and displayed.
	// data-time-utc:       (optional) The UTC time to be converted and displayed. Pulls from .text() or .val() if not set.
 
    var longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var ordinals = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
 
    var formatters = [
        { pattern: 'yyyy', parser: '\\d{4}',              reader: function () { return leadZeros(this.year, 4); },              mapper: function(value) { this.setUTCFullYear(parseInt(value)); } },  
        { pattern: 'yy',   parser: '\\d{2}',              reader: function () { return leadZeros(this.year, 2); },              mapper: function(value) { this.setUTCFullYear(parseInt(getCentury() + value)); } },
        { pattern: 'MMMM', parser: longMonths.join('|'),  reader: function () { return longMonths[this.month]; },               mapper: function(value) { this.setUTCMonth(indexOf(longMonths, value)); } },
        { pattern: 'MMM',  parser: shortMonths.join('|'), reader: function () { return shortMonths[this.month]; },              mapper: function(value) { this.setUTCMonth(indexOf(shortMonths, value)); } },
        { pattern: 'MM',   parser: '\\d{2}',              reader: function () { return leadZeros(this.month, 2); },             mapper: function(value) { this.setUTCMonth(parseInt(value) - 1); } },
        { pattern: 'M',    parser: '\\d{1,2}',            reader: function () { return this.month; },                           mapper: function(value) { this.setUTCMonth(parseInt(value) - 1); } },
        { pattern: 'dddd', parser: longDays.join('|'),    reader: function () { return longDays[this.dayOfWeek]; },             mapper: function(value) { } },
        { pattern: 'ddd',  parser: shortDays.join('|'),   reader: function () { return shortDays[this.dayOfWeek]; },            mapper: function(value) { } },
        { pattern: 'dd',   parser: '\\d{2}',              reader: function () { return leadZeros(this.day, 2); },               mapper: function(value) { this.setUTCDate(parseInt(value)); } },
        { pattern: 'd',    parser: '\\d{1,2}',            reader: function () { return this.day; },                             mapper: function(value) { this.setUTCDate(parseInt(value)); } },
        { pattern: 'HH',   parser: '\\d{2}',              reader: function () { return leadZeros(this.hour24, 2); },            mapper: function(value) { this.setUTCHours(parseInt(value)); } },
        { pattern: 'H',    parser: '\\d{1,2}',            reader: function () { return this.hour24; },                          mapper: function(value) { this.setUTCHours(parseInt(value)); } },
        { pattern: 'hh',   parser: '\\d{2}',              reader: function () { return leadZeros(this.hour12, 2); },            mapper: function(value) { this.setUTCHours(parseInt(value) % 12); } },
        { pattern: 'h',    parser: '\\d{1,2}',            reader: function () { return this.hour12; },                          mapper: function(value) { this.setUTCHours(parseInt(value) % 12); } },
        { pattern: 'mm',   parser: '\\d{2}',              reader: function () { return leadZeros(this.minute, 2); },            mapper: function(value) { this.setUTCMinutes(parseInt(value)); } },
        { pattern: 'm',    parser: '\\d{1,2}',            reader: function () { return this.minute; },                          mapper: function(value) { this.setUTCMinutes(parseInt(value)); } },
        { pattern: 'ss',   parser: '\\d{2}',              reader: function () { return leadZeros(this.second, 2); },            mapper: function(value) { this.setUTCSeconds(parseInt(value)); } },
        { pattern: 's',    parser: '\\d{1,2}',            reader: function () { return this.second; },                          mapper: function(value) { this.setUTCSeconds(parseInt(value)); } },
        { pattern: 'o',    parser: 'th|st|nd|rd',         reader: function () { return this.ordinal; },                         mapper: function(value) { } },
        { pattern: 'TT',   parser: 'AM|PM',               reader: function () { return this.ampm.toUpperCase(); },              mapper: function(value) { pmAdjust(this, value); } },
        { pattern: 'T',    parser: 'A|P',                 reader: function () { return this.ampm.toUpperCase().substr(0, 1); }, mapper: function(value) { pmAdjust(this, value); } },
        { pattern: 'tt',   parser: 'am|pm',               reader: function () { return this.ampm.toLowerCase(); },              mapper: function(value) { pmAdjust(this, value); } },
        { pattern: 't',    parser: 'a|p',                 reader: function () { return this.ampm.toLowerCase().substr(0, 1); }, mapper: function(value) { pmAdjust(this, value); } }
    ];
	
	var defaults = {
		format: { attribute: 'data-time-format', value: 'MMMM do, hh:mm:ss tt' },
		utc: { attribute: 'data-time-utc' }
	}
   
    $.fn.clientTime = function (config) {
		config = config || {};
        return $(this).each((function (config) { return function() {
            var target = $(this);
            var isInput = target.is('input, select, textarea');
            var format = config.format || target.attr(defaults.format.attribute) || defaults.format.value;
			var timeString = config.utc
			              || target.attr(defaults.utc.attribute)
			              || (isInput ? target.val() : target.text());
            var dateObject = (!!timeString) ? parseDate(timeString, format) : new Date();
			var local = mapLocal(dateObject);
            var formatted = formatLocal(local, format);
           
            if (isInput) { target.val(formatted); }
            else { target.text(formatted); }
        };})(config));
    };
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	/////// Poor-man's linq
	function select(items, selector) { var r = []; for (var i = 0; i < items.length; i++) { r.push(selector.call(items[i])); } return r; };
	function where(items, test) { var r = []; for (var i = 0; i < items.length; i++) { if (test.call(items[i])) { r.push(items[i]); } } return r; };
	function count(items, test) { return where(items, test).length; }
	function indexOf(items, value) { for (var i = 0; i < items.length; i++) { if (items[i] === value) { return i; } } return -1; };
	
	/////// Formatters break-out
	var patterns = select(formatters, function() { return this.pattern; });
	var parsers = select(formatters, function() { return this.parser; });
	var readers = select(formatters, function() { return this.reader; });
	var mappers = select(formatters, function() { return this.mapper; });
	
	/////// Date/time helpers
	function getCentury() { return (new Date()).getFullYear().toString().substr(0, 2); }
	
	function pmAdjust(date, value) { 
		var day = date.getUTCDate();
		var hour = date.getUTCHours();
		var indicator = value.substr(0, 1).toLowerCase();
		if (hour < 12 && indicator === 'p') { 
			date.setUTCHours(hour + 12); 
		} else if (hour >= 12 && indicator === 'a') {
			date.setUTCHours(hour - 12);
		}
		date.setUTCDate(day);
	}
	
    function to12Hour(hour24) { return (hour24 %= 12) === 0 ? 12 : hour24; }
 
    function leadZeros(value, desiredLength) { return (Array(desiredLength + 1).join('0') + value).slice(-desiredLength); }
 
    function getOrdinal(dayOfMonth) {
        var tens = dayOfMonth.toString().slice(-2);
        var isTeen = tens.length === 2 && tens.substr(0, 1) === '1';
        return isTeen ? 'th' : ordinals[dayOfMonth % ordinals.length];
    }
	
	/////// Parsing helpers	
	function indexFormat(format) { // Converts a format string to be indexed ("hh:mm:ss:tt" -> "<13>:<14>:<16>:<19>")
		format = format.replace(/(<|>)/g, '<$1>');
		for (var i = 0; i < patterns.length; i++) { 
			format = format.replace(new RegExp(patterns[i], 'g'), '<' + i + '>'); 
		}
		return format;
	}
	
	function unescapeIndexedFormat(f) { return f.replace(/<<>/g, '<').replace(/<>>/g, '>'); }
	
	function groupIndexes(indexed) { // Groups an indexed format string so it can be parsed and mapped
		indexed = indexed.replace(/(<\d+>)/g, '(?:$1)');
		for (var i = 0; i < patterns.length; i++) { indexed = indexed.replace('(?:<' + i + '>)', '(<' + i + '>)'); }
		return indexed;
	}
	
	function getIndexMap(indexed) { // Maps Regex groups to value mappers
		var positions = [];
		for (var p = 0; p < patterns.length; p++) { 
			positions.push(indexed.indexOf('<' + p + '>')); 
		}
		var indexes = [];
		for (var i = 0; i < positions.length; i++) {
			indexes.push(positions[i] < 0 ? -1 : count(positions, function() { return this >= 0 && this < positions[i]; }) + 1);
		}
		return indexes;
	}
	
	function formatParser(indexed) { // Creates a regular expression string that will parse a formatted date
		var grouped = groupIndexes(indexed);
		for (var i = 0; i < parsers.length; i++) {
			grouped = grouped.replace(new RegExp('<' + i + '>', 'g'), parsers[i]);
		}
		return grouped;
	}
	
	function parseDate(from, format) { // Parses a date from a string using the specified format
		var indexed = indexFormat(format);
		var map = getIndexMap(indexed);
		var parser = formatParser(indexed);
		var utc = (new RegExp(parser)).exec(from);
		return mapUtc(utc, map);
	}
	
	function mapUtc(utc, map) { // Builds a date with values parsed from a formatted date string
		var date = new Date();
		for(var i = 0; i < mappers.length; i++) {
			if (map[i] >= 0) {
				var value = utc[map[i]];
				mappers[i].call(date, value);
			}
		}
		return date;
	}
	
	function mapLocal(date) { // Maps pertinent values from a date object
        var local = {};
        local.year = date.getFullYear();
        local.month = date.getMonth();
        local.day = date.getDate();
        local.dayOfWeek = date.getDay();
        local.hour24 = date.getHours();
        local.hour12 = to12Hour(local.hour24);
        local.minute = date.getMinutes();
        local.second = date.getSeconds();
        local.ordinal = getOrdinal(local.day);
        local.ampm = local.hour24 >= 12 ? 'PM' : 'AM';
        return local;
	}
	
	function formatLocal(map, format) { // Formats a mapped date object based on a format string
		format = indexFormat(format);
		for (var i = 0; i < readers.length; i++) { 
			format = format.replace(new RegExp('<' + i + '>', 'g'), readers[i].call(map)); 
		}
        return unescapeIndexedFormat(format);
	}
})(jQuery);