const EXAMPLEWEBSITE_2021 = EXAMPLEWEBSITE_2021 || {};

(function (_) {

	const _init = () => {
		helloWorld('Hello, World');
	}

	const helloWorld = ($text) => {
		console.log($text);
	}

	_.init = _init();
})(EXAMPLEWEBSITE_2021);

EXAMPLEWEBSITE_2021.init
