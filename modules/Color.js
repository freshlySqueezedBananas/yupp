var Color = {
	palette: {
		red: {
			name: 'red',
			active: false,
			hex: "#fe0000",
			image: 'superb.png'
		},
		orange: {
			name: 'orange',
			active: false,
			hex: "#ff8300",
			image: 'mega.png'
		},
		yellow: {
			name: 'yellow',
			active: false,
			hex: "#f0ff00",
			image: 'moche.png'
		},
		green: {
			name: 'green',
			active: false,
			hex: "#09ff00",
			image: 'sicr.png'
		},
		blue: {
			name: 'blue',
			active: false,
			hex: "#011efe",
			image: 'redb.png'
		},
		purple: {
			name: 'purple',
			active: false,
			hex: "#ff00db",
			image: 'mnc.png'
		},
		cyan: {
			name: 'cyan',
			active: false,
			hex: "#00ecff",
			image: 'meo.png'
		}
	},
	pick: function() {
		var available = _.where(Color.palette, {active: false});
		var pick;

		if (available.length > 0) {
			pick = _.shuffle(available)[0];

			Color.palette[pick.name].active = true;
		}

		return pick;
	}
}

module.exports = Color;