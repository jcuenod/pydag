var normalizePolytonicGreekToLowerCase = (text) => {
	text = text.replace(/[ΆΑάἀἁἂἃἄἅἆἇὰάᾀᾁᾂᾃᾄᾅᾆᾇᾰᾱᾲᾳᾴᾶᾷἈἉἊἋἌἍἎἏᾈᾉᾊᾋᾌᾍᾎᾏᾸᾹᾺΆᾼ]/g,'α');
	text = text.replace(/[ΈΕέἐἑἒἓἔἕὲέἘἙἚἛἜἝῈΈ]/g,'ε');
	text = text.replace(/[ΉΗήἠἡἢἣἤἥἦἧὴήᾐᾑᾒᾓᾔᾕᾖᾗῂῃῄῆῇἨἩἪἫἬἭἮἯᾘᾙᾚᾛᾜᾝᾞᾟῊΉῌ]/g,'η');
	text = text.replace(/[ΊΪΙίΐἰἱἲἳἴἵἶἷὶίῐῑῒΐῖῗἸἹἺἻἼἽἾἿῘῙῚΊ]/g,'ι');
	text = text.replace(/[ΌΟόὀὁὂὃὄὅὸόὈὉὊὋὌὍῸΌ]/g,'ο');
	text = text.replace(/[ΎΫΥΰϋύὐὑὒὓὔὕὖὗὺύῠῡῢΰῦῧὙὛὝὟῨῩῪΎ]/g,'υ');
	text = text.replace(/[ΏΩώὠὡὢὣὤὥὦὧὼώᾠᾡᾢᾣᾤᾥᾦᾧῲῳῴῶῷὨὩὪὫὬὭὮὯᾨᾩᾪᾫᾬᾭᾮᾯῺΏῼ]/g,'ω');
	text = text.replace(/[ῤῥῬ]/g,'ρ');
	return text.toLowerCase();
}
var latinGreekMapExtra = {
	"α":"a",
	"β":"b",
	"γ":"g",
	"δ":"d",
	"ε":"e",
	"ζ":"z",
	"η":"e",
	"θ":"th",
	"ι":"i",
	"κ":"k",
	"λ":"l",
	"μ":"m",
	"ν":"n",
	"ξ":"x",
	"ο":"o",
	"π":"p",
	"ρ":"r",
	"σ":"s",
	"ς":"s",
	"τ":"t",
	"υ":"u",
	"φ":"ph",
	"χ":"ch",
	"ψ":"ps",
	"ω":"o",
	//extra
	"f": "ph",
	"j":"i",
}
var latinise = (text) => text.replace(new RegExp("[" + Object.keys(latinGreekMapExtra).join() + "]", "g"), (m) => latinGreekMapExtra[m])


function getSuggestions(value) {
	const escapedValue = escapeRegexCharacters(value.trim());

	if (escapedValue === '') {
		return [];
	}

	const regex = new RegExp('^' + escapedValue, 'i');

	return languages.filter(language => regex.test(language.name));
}

function renderSuggestion(suggestion) {
	return (
		<span>{suggestion.word}</span>
	);
}

var App = React.createClass({
	getInitialState: function() {
		this.serverRequest = $.getJSON("data/bdag.json", function (result) {
			var definition_data = result.map((word_data) => {
				var ret = Object.assign(word_data)
				ret["normalised_word"] = latinise( normalizePolytonicGreekToLowerCase(word_data.word) )
				return ret
			})
			this.setState({"lexeme_data": definition_data});

		}.bind(this));
		return {
			"lexeme_data": [],
			"filter": "",
			"selected": null,
			"value": '',
			"suggestions": [],
			"noSuggestions": false
		};
	},
	handleChangeText(event) {
		this.setState({"filter": event.target.value});
		this.setState({"selected": null});
	},
	onAutosuggestChange(event, { newValue, method }) {
		this.setState({
			"value": newValue
		})
	},
	onSuggestionsFetchRequested({value}){
		var lx = this.state.lexeme_data
		var that_filter = latinise( normalizePolytonicGreekToLowerCase(value) )
		var filtered_data = (that_filter === "") ? [] : lx.filter((x) => {
			return x["normalised_word"].search(new RegExp("^" + that_filter, "i")) !== -1;
		});
		const suggestions = filtered_data.slice(0, 10);
		const isInputBlank = value.trim() === '';
		const noSuggestions = !isInputBlank && suggestions.length === 0;

		this.setState({ suggestions, noSuggestions });
	},
	onSuggestionsClearRequested(){
		this.setState({
			"suggestions": []
		});
	},
	storeInputReference(autosuggest){
		if (autosuggest !== null) {
			this.setState({"selected": autosuggest.input});
		}
	},
	render: function() {
		// var filtered_data = [];
		// var that_pos_filter = this.state.pos_filter;
		// var lx = this.state.lexeme_data
		// var that_filter = normalizePolytonicGreekToLowerCase(this.state.filter);
		// filtered_data = (this.state.filter === "") ? [] : lx.filter(function(x){
		// 	return x["normalised_word"].search(new RegExp("^" + that_filter, "i")) !== -1;
		// });
		// var top_results = filtered_data.slice(0, 5);

		// var table_of_lexemes = (
		// 	<table className="pure-table">
		// 		<thead><tr>
		// 			<td>Lexemes</td>
		// 		</tr></thead>
		// 		<tbody>
		// 			{top_results.map((data, i) => (
		// 				<tr><td onClick={() => this.setState({"selected": data})}>{data.word}</td></tr>
		// 			))}
		// 		</tbody>
		// 	</table>
		// )
		var definition_to_display = (<div></div>)
		// if (top_results.length === 1 || this.state.selected)
		if (this.state.selected)
		{
			var definition_text = this.state.selected ? this.state.selected.definition : ""
			definition_to_display = (<div className="definition" dangerouslySetInnerHTML={{__html: definition_text}} />)
		}

		const inputProps = {
			"placeholder": "Type in unicode Greek",
			"value": this.state.value,
			"onChange": this.onAutosuggestChange
		};

	// 	<!--<form className="pure-form">
	// 	<input type="text" onChange={this.handleChangeText} />
	// </form>-->
		return (
			<div>
				<h1>BDAG Lookup</h1>
				<Autosuggest
					suggestions={this.state.suggestions}
					onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
					onSuggestionsClearRequested={this.onSuggestionsClearRequested}
					getSuggestionValue={(suggestion) => {this.setState({"selected": suggestion}); return suggestion.word}}
					renderSuggestion={renderSuggestion}
					inputProps={inputProps}
					ref={this.storeInputReference} />

				{definition_to_display}
			</div>
		);
	}
});

ReactDOM.render(
	<App />,
	document.getElementById('app')
);
