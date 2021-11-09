var rhit = rhit || {};
rhit.FB_KEY_USER = "user";
rhit.FB_KEY_WORKOUTS = "workouts";
rhit.FB_KEY_WORKOUT_TYPE = "workoutType";
rhit.FB_KEY_DISTANCE = "distance";
rhit.FB_KEY_TIME = "time";
rhit.FB_KEY_DATE = "date";
rhit.FB_KEY_LIFT_TYPE = "liftType";
rhit.FB_KEY_REPS = "reps";
rhit.FB_KEY_SETS = "sets";
rhit.FB_KEY_WEIGHT = "weight";
rhit.FB_KEY_RUNTITLE = "runTitle";
rhit.FB_KEY_FIXED = "fixed";

var userIdentification = "null";
const runColor = "rgb(255, 165, 0)";
const liftColor = "rgb(0, 128, 0)";
const bothColor = "rgb(255, 192, 203)";

rhit.MainPageController = class {
	constructor() {
		this._ref = firebase.firestore().collection(rhit.FB_KEY_WORKOUTS);
		this._documentSnapshots = [];
		document.querySelector("#runButton").addEventListener("click", (event) => {
			window.location.href = "/run.html";
		});
		document.querySelector("#liftButton").addEventListener("click", (event) => {
			window.location.href = "/lift.html";
		});
		$(document).on("click", `#${rhit.getDate()}`, function () {
			console.log("Clicked current day");
		});
		document.querySelector("#logout").onclick = (event) => {
			console.log("sign out");
			rhit.fbAuthManager.signOut();
		}
		this.populateExercisesOnCalendar();
		this.selectDate(rhit.getDate());
	}
	selectDate(date) {
		let choppedDate = date.slice(0, 6);
		console.log(choppedDate);
		for (let i = 0; i < 31; i++) {
			console.log(`View workouts on ${choppedDate}${checkTime(i)}`);
			$(document).on("click", `#${choppedDate}${checkTime(i)}`, function () {
				window.location.href = `/day.html?day=${choppedDate}${checkTime(i)}`;
			});
		}
	}
	populateExercisesOnCalendar() {
		this._ref.where(rhit.FB_KEY_USER, "==", userIdentification)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					let button = $(`#${doc.data().date}`);
					button.css("border-radius", "30px");
					let buttonColor = undefined;
					if (button.css("background-color") == runColor && doc.data().workoutType == 'lift') {
						buttonColor = bothColor;
						console.log("here");
					}
					else if (button.css("background-color") == liftColor && doc.data().workoutType == 'run') {
						buttonColor = bothColor;
						console.log("here");
					}
					else if (button.css("background-color") != bothColor && buttonColor == undefined) {
						if (doc.data().workoutType === 'lift') {
							buttonColor = liftColor;
						} else {
							buttonColor = runColor;
						}
					}
					button.css("background-color", buttonColor);
				});
			})
			.catch((error) => {
				console.log("Error getting documents: ", error);
			});
	}
}

rhit.DayPageController = class {
	constructor() {
		this._ref = firebase.firestore().collection(rhit.FB_KEY_WORKOUTS);
		this._documentSnapshots = [];
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const currentDay = urlParams.get("day");

		$("#back").on("click", (event) => {
			window.location.href = `/main.html`;
		});
		document.querySelector("#homePageLink").addEventListener("click", (event) => {
			window.location.href = "/main.html";
		});
		$("#runButtonDay").on("click", (event) => {
			window.location.href = `/run.html?day=${currentDay}`;
		});
		$("#liftButtonDay").on("click", (event) => {
			window.location.href = `/lift.html?day=${currentDay}`;
		});
		this.checkWorkoutClick(currentDay);
		this.getCurrentDay(currentDay);
		this.addWorkouts(currentDay);
	}

	checkWorkoutClick(currentDay) {
		this._ref.where(rhit.FB_KEY_USER, "==", userIdentification)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					if (doc.data().date == currentDay) {
						console.log(doc.data().runTitle);
						if (doc.data().workoutType == 'lift') {
							let temp = doc.data().liftType;
							$(document).on("click", `#${temp}`, function () {
								window.location.href = `/workout.html?title=${temp}&day=${currentDay}&type=lift`;
							});
						} else {
							let temp2 = doc.data().runTitle.replace(/\s/g, '');
							$(document).on("click", `#${temp2}`, function () {
								window.location.href = `/workout.html?title=${doc.data().runTitle}&day=${currentDay}&type=run`;
							});
						}
					}
				});
			})
			.catch((error) => {
				console.log("Error getting documents: ", error);
			});
	}

	getCurrentDay(currentDay) {
		console.log("currentDay: ", currentDay);
		let date = currentDay.slice(4, 6) + "/" + currentDay.slice(6, 8) + "/" + currentDay.slice(0, 4);
		$('#dayHeader').html(`Workouts from ${date}`);
	}

	addWorkouts(currentDay) {
		this._ref.where(rhit.FB_KEY_USER, "==", userIdentification)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					if (doc.data().date == currentDay) {
						if (doc.data().workoutType == 'lift') {
							console.log("LIFT");
							document.getElementById("liftContainer").style.display = "block";
							document.querySelector("#liftContainer").appendChild(this.addLift(doc.data()));
						} else {
							console.log("RUN");
							document.getElementById("runContainer").style.display = "block";
							document.querySelector("#runContainer").appendChild(this.addRun(doc.data()));
						}
					}
				});
			})
			.catch((error) => {
				console.log("Error getting documents: ", error);
			});
	}
	addLift(workout) {
		return htmlToElement(`
		<details>
            <summary>${workout.liftType}</summary>
			<div id="${workout.liftType}" class="row">
				<div class="column">
					<p>Sets: ${workout.sets}</p>
					<p>Reps: ${workout.reps}</p>
					<p>Weight: ${workout.weight}</p>
				</div>
				<div class="column">
					<i class="material-icons editer">edit</i>
				</div>
			</div>
        </details>`);
	}
	addRun(workout) {
		return htmlToElement(`
		<details>
            <summary>${workout.runTitle}</summary>
			<div id="${workout.runTitle.replace(/\s/g, '')}" class="row">
				<div class="column">
					<p>Time: ${workout.time}</p>
					<p>Distance: ${workout.distance}</p>
				</div>
				<div class="column">
					<i class="material-icons editer">edit</i>
				</div>
			</div>
        </details>`);
	}
}

rhit.WorkoutPageController = class {
	constructor() {
		this._ref = firebase.firestore().collection(rhit.FB_KEY_WORKOUTS);
		this._documentSnapshots = [];

		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const currentDay = urlParams.get("day");
		const title = urlParams.get("title");
		const type = urlParams.get("type");
		const oldRunTitle = title;

		document.querySelector("#homePageLink").addEventListener("click", (event) => {
			window.location.href = "/main.html";
		});
		document.querySelector("#back").addEventListener("click", (event) => {
			window.location.href = `/day.html?day=${currentDay}`;
		});
		document.querySelector("#delete").addEventListener("click", (event) => {
			this.deleteWorkout(currentDay, title);
		});
		document.querySelector("#runSubmitButtonW").addEventListener("click", (event) => {
			let time = document.querySelector("#runTimeInputW").value;
			let distance = document.querySelector("#runDistanceInputW").value;
			let title = document.querySelector("#runTitleInputW").value;
			if (title.length == 0 || distance.length <= 0 || time.toString() == "00:00:00") {
				return;
			}
			this.editRun(distance, time, title, currentDay, oldRunTitle);
		});
		this.getWorkoutInfo(currentDay, title, type);

		document.querySelector("#liftSubmitButtonW").addEventListener("click", (event) => {
			this._ref.where(rhit.FB_KEY_USER, "==", userIdentification)
				.get()
				.then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if (doc.data().date == currentDay && title == doc.data().liftType) {
							let fixed = doc.data().fixed;
							let reps = new Array(0);
							let weight = new Array(0);
							let sets = undefined;

							if (fixed == "true") {
								sets = document.querySelector("#setsInputW").value;
								for (let i = 0; i < sets; i++) {
									reps.push(document.querySelector("#repsInputW").value);
									weight.push(document.querySelector("#weightInputW").value);
								}
							} else {
								console.log("The num of sets is ", doc.data().sets);
								sets = doc.data().sets;
								for (let i = 0; i < sets; i++) {
									reps.push($(`#repsInput${i}`).val());
									weight.push($(`#weightInput${i}`).val());
								}
							}
							if (sets <= 0 || reps.length <= 0 || weight.length <= 0) {
								return;
							}
							this.editLift(reps, weight, sets, currentDay, title);
						}
					});
				})
		});
	}

	editLift(reps, weight, sets, currentDay, title) {
		console.log("Reps: " + reps + " Weight: " + weight + " Sets: " + sets);
		this._ref.where(rhit.FB_KEY_USER, "==", userIdentification)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					if (doc.data().date == currentDay && title == doc.data().liftType) {
						this._ref.doc(doc.id).update({
								[rhit.FB_KEY_REPS]: reps,
								[rhit.FB_KEY_SETS]: sets,
								[rhit.FB_KEY_WEIGHT]: weight,
							}).then(function () {
								window.location.href = `/day.html?day=${currentDay}`;
							})
							.catch(function (error) {
								console.log("Error adding document ", error);
							});
					}
				});
			})
	}

	getWorkoutInfo(currentDay, title, type) {
		let date = currentDay.slice(4, 6) + "/" + currentDay.slice(6, 8) + "/" + currentDay.slice(0, 4);
		let time = undefined;
		let distance = undefined;
		$('#dayHeaderWorkout').html(`${title} from ${date}`);
		$('#workoutTitle').html(``);
		if (type == "run") {
			this._ref.where(rhit.FB_KEY_USER, "==", userIdentification)
				.get()
				.then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						// doc.data() is never undefined for query doc snapshots
						if (doc.data().date == currentDay && title == doc.data().runTitle) {
							time = doc.data().time;
							distance = doc.data().distance;
						}
						document.getElementById("workoutRunContainer").style.display = "block";
						document.querySelector("#runTitleInputW").value = title;
						document.querySelector("#runTimeInputW").value = time;
						document.querySelector("#runDistanceInputW").value = distance;
						document.getElementById("workoutLiftContainer").style.display = "none";
					});
				})
		} else {
			let sets = undefined;
			let reps = undefined;
			let weight = undefined;
			this._ref.where(rhit.FB_KEY_USER, "==", userIdentification)
				.get()
				.then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if (doc.data().date == currentDay && title == doc.data().liftType && doc.data().fixed == "true") {
							document.getElementById("fixedWeightContainerW").style.display = "block";
							document.getElementById("workoutLiftContainer").style.display = "block";
							sets = doc.data().sets;
							reps = doc.data().reps[0];
							weight = doc.data().weight[0];
							document.querySelector("#setsInputW").value = sets;
							document.querySelector("#repsInputW").value = reps;
							document.querySelector("#weightInputW").value = weight;
						} else {
							if (doc.data().date == currentDay && title == doc.data().liftType && doc.data().fixed == "false") {
								document.getElementById(`customWeightContainer`).style.display = "block";
								document.getElementById("workoutLiftContainer").style.display = "block";
								for (let i = 0; i < doc.data().sets; i++) {
									console.log("here yp");
									document.querySelector("#customWeightContainer").appendChild(this.addSet(i));
									// $(`#setCount${i}`).value = i+1
									$(`#repsInput${i}`).attr('value', doc.data().reps[i]);
									console.log($(`#repsInput${i}`));
									$(`#weightInput${i}`).attr('value', doc.data().weight[i]);
								}
							}
						}
					});
				})
		}
	}

	addSet(setNum) {
		return htmlToElement(`
		<tr class="customWeightEntry" class="row">
			<td>	
				<h1 class="setCount" id="setCount${setNum+1}">Set ${setNum+1}</h1>
			</td>
			<td>
				<label for="repsInput${setNum}">Reps</label>
				<input type="number" class="form-control number" id="repsInput${setNum}" placeholder="Enter the number of reps you did each set">
			</td>
			<td>
				<label for="weightInput${setNum}">Weight</label>
				<input type="number" class="form-control number" id="weightInput${setNum}" placeholder="Enter the weight you lifted">
			</td>
		</tr>`);
	}

	editRun(distance, time, title, currentDay, oldRunTitle) {
		this._ref.where(rhit.FB_KEY_USER, "==", userIdentification)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					if (doc.data().date == currentDay && oldRunTitle == doc.data().runTitle) {
						this._ref.doc(doc.id).update({
								[rhit.FB_KEY_TIME]: time,
								[rhit.FB_KEY_DISTANCE]: distance,
								[rhit.FB_KEY_USER]: userIdentification,
								[rhit.FB_KEY_RUNTITLE]: title,
								[rhit.FB_KEY_WORKOUT_TYPE]: "run",
							}).then(function () {
								window.location.href = `/day.html?day=${currentDay}`;
							})
							.catch(function (error) {
								console.log("Error adding document ", error);
							});
					}
				});
			})
	}

	deleteWorkout(currentDay, title) {
		this._ref.where(rhit.FB_KEY_USER, "==", userIdentification)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					// doc.data() is never undefined for query doc snapshots
					if (doc.data().date == currentDay && (title == doc.data().runTitle || title == doc.data().liftType)) {
						doc.ref.delete().then(() => {
							console.log("Deleted");
							window.location.href = `/day.html?day=${currentDay}`;
						});
					}
				});
			})
			.catch((error) => {
				console.log("Error getting documents: ", error);
			});
	}
}

rhit.RunPageController = class {
	constructor() {
		this._ref = firebase.firestore().collection(rhit.FB_KEY_WORKOUTS);

		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const currentDay = urlParams.get("day");
		let date = null;
		if (currentDay == null) {
			date = rhit.getDate();
		} else {
			date = currentDay;
		}

		document.querySelector("#homePageLink").addEventListener("click", (event) => {
			window.location.href = "/main.html";
		});
		document.querySelector("#runSubmitButton").addEventListener("click", (event) => {
			let time = document.querySelector("#runTimeInput").value;
			let distance = document.querySelector("#runDistanceInput").value;
			let title = document.querySelector("#runTitleInput").value;
			if (title.length == 0 || distance.length == 0 || time.toString() == "00:00:00") {
				return;
			}
			this.addRun(distance, time, date, title);
		});
	}
	addRun(distance, time, date, title) {
		console.log("here");
		this._ref.add({
				[rhit.FB_KEY_TIME]: time,
				[rhit.FB_KEY_DISTANCE]: distance,
				[rhit.FB_KEY_DATE]: date,
				[rhit.FB_KEY_USER]: userIdentification,
				[rhit.FB_KEY_RUNTITLE]: title,
				[rhit.FB_KEY_WORKOUT_TYPE]: "run",

			}).then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
				window.location.href = "/main.html";
			})
			.catch(function (error) {
				console.log("Error adding document ", error);
			});
	}
}

rhit.LiftPageController = class {
	constructor() {
		this._ref = firebase.firestore().collection(rhit.FB_KEY_WORKOUTS);
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const currentDay = urlParams.get("day");
		let date = null;
		if (currentDay == null) {
			date = rhit.getDate();
		} else {
			date = currentDay;
		}
		this.numSets = 1;
		this.fixedSets = true;

		document.querySelector("#homePageLink").addEventListener("click", (event) => {
			window.location.href = "/main.html";
		});

		this.checkForExisting(date);
		document.querySelector("#fixedWeightCheckbox").addEventListener("click", (event) => {  //toggling fixedSets
			if (!document.querySelector("#fixedWeightCheckbox").checked) {
				document.getElementById("fixedWeightContainer").style.display = "none";
				document.getElementById("customWeightContainer").style.display = "block";
				this.fixedSets = false;
			} else {
				document.getElementById("fixedWeightContainer").style.display = "block";
				document.getElementById("customWeightContainer").style.display = "none";
				this.fixedSets = true;
			}
			this.numSets = 1;
		})
		
		document.querySelector("#addSet").addEventListener("click", (event) => { //additional sets not fixed
			console.log("added");
			document.querySelector(".customWeightEntry").appendChild(this.addSet(this.numSets));
			this.numSets++;
		});
		
		document.querySelector("#liftSubmitButton").addEventListener("click", (event) => { //reading after submit
			let bench = document.querySelector("#bench").checked;
			let squat = document.querySelector("#squat").checked;
			let deadlift = document.querySelector("#deadlift").checked;
			let liftType = "null";
			if (bench) {
				liftType = "bench";
			} else if (squat) {
				liftType = "squat";
			} else if (deadlift) {
				liftType = "deadlift";
			}
			let reps = new Array(0);
			let weight = new Array(0);
			if (this.fixedSets) {
				this.numSets = document.querySelector("#setsInput").value;
				for (let i = 0; i < this.numSets; i++) {
					reps.push(document.querySelector("#repsInput").value);
					weight.push(document.querySelector("#weightInput").value);
				}
			} else {
				console.log("The num of sets is ", this.numSets);
				for (let i = 1; i < this.numSets; i++) {
					reps.push($(`#repsInput${i}`).val());
					weight.push($(`#weightInput${i}`).val());
				}
				this.numSets--;
			}
			console.log("Reps: ", reps);
			console.log("Weight: ", weight);
			if (reps.length <= 0 || weight.length <= 0 || liftType == "null") {
				return;
			}
			this.addLift(this.numSets, reps, weight, liftType, date, this.fixedSets.toString());
		});
	}
	checkForExisting(date) {
		this._ref.where(rhit.FB_KEY_USER, "==", userIdentification)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					// doc.data() is never undefined for query doc snapshots
					if (doc.data().date == date) {
						if (doc.data().workoutType == 'lift' && doc.data().liftType == 'deadlift') {
							console.log("wee made it");
							document.getElementById("deadliftInput").style.display = "none";
						}
						if (doc.data().workoutType == 'lift' && doc.data().liftType == 'bench') {
							document.getElementById("benchInput").style.display = "none";
						}
						if (doc.data().workoutType == 'lift' && doc.data().liftType == 'squat') {
							document.getElementById("squatInput").style.display = "none";
						}
						if (document.getElementById("squatInput").style.display == "none" && document.getElementById("benchInput").style.display == "none" && document.getElementById("deadliftInput").style.display == "none") {
							document.getElementById("liftSelection").style.display = "none";
							document.querySelector("#returnScreen").appendChild(this.addReturnScreen(doc.data()));
						}
					}
				});
			})
			.catch((error) => {
				console.log("Error getting documents: ", error);
			});
	}

	addReturnScreen() {
		return htmlToElement(`
			<p>All lifts completed. Please return to Home Page :)</p>
         `);
	}

	addSet(setNum) {
		return htmlToElement(`
		<tr class="customWeightEntry">
			<td>
				<h1 id="setCount">Set ${setNum}</h1>
			</td>
			<td>
				<label for="repsInput${setNum}">Reps</label>
				<input type="number" class="form-control number" id="repsInput${setNum}" placeholder="Enter the number of reps you did each set">
			</td>
			<td>
				<label for="weightInput${setNum}">Weight</label>
				<input type="number" class="form-control number" id="weightInput${setNum}" placeholder="Enter the weight you lifted">
			</td>
		</tr>`);
	}

	addLift(sets, reps, weight, liftType, date, fixed) {
		this._ref.add({
				[rhit.FB_KEY_DATE]: date,
				[rhit.FB_KEY_LIFT_TYPE]: liftType,
				[rhit.FB_KEY_REPS]: reps,
				[rhit.FB_KEY_SETS]: sets,
				[rhit.FB_KEY_USER]: userIdentification,
				[rhit.FB_KEY_WEIGHT]: weight,
				[rhit.FB_KEY_FIXED]: fixed,
				[rhit.FB_KEY_WORKOUT_TYPE]: "lift"

			}).then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
				window.location.href = "/main.html";
			})
			.catch(function (error) {
				console.log("Error adding document ", error);
			});
	}
}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
		console.log("Made Auth Manager");
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
			if (user) {
				const uid = user.uid;
			}
		});
	}
	signIn() {
		console.log("Sign in");
	}
	signOut() {
		firebase.auth().signOut().then(() => {
			console.log("Sign-out successful.");
		}).catch((error) => {
			console.log("Sign out, an error happened.");
		});
	}
	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}
}

rhit.getDate = function () { 	//From https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0');
	var yyyy = today.getFullYear();
	return yyyy + mm + dd;
}

rhit.startFirebase = function () {
	if (!document.querySelector("#loginPage")) {
		return;
	}
	var uiConfig = {	// FirebaseUI config.
		signInSuccessUrl: '/',
		signInOptions: [
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.PhoneAuthProvider.PROVIDER_ID,
			firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
		],
	};

	const ui = new firebaseui.auth.AuthUI(firebase.auth());	// Initialize the FirebaseUI Widget using Firebase.
	ui.start('#firebaseui-auth-container', uiConfig); // The start method will wait until the DOM is loaded.
}

rhit.initFireAuth = function () {
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			const uid = user.uid;
			userIdentification = uid;
			const displayName = user.displayName;
			const email = user.email;
			const isAnonymous = user.isAnonymous;
			const phoneNumber = user.phoneNumber;
			const photoURL = user.photoURL;
		} else {
			console.log("No user signed in!");
		}

	});
}

rhit.main = function () {
	console.log("Ready");

	rhit.initFireAuth();
	rhit.startFirebase();
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("auth changed callback fired");
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);
		if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
			window.location.href = "/main.html"
		}
		if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
			window.location.href = "/";
		}
		console.log("Ready and signed in");

		if (document.querySelector("#mainPage")) {
			rhit.MainPageController = new rhit.MainPageController(userIdentification);
			startDate();
		}
		if (document.querySelector("#runPage")) {
			rhit.RunPageController = new rhit.RunPageController();
		}
		if (document.querySelector("#liftPage")) {
			rhit.LiftPageController = new rhit.LiftPageController();
		}
		if (document.querySelector("#dayPage")) {
			rhit.DayPageController = new rhit.DayPageController();
		}
		if (document.querySelector("#workoutPage")) {
			rhit.WorkoutPageController = new rhit.WorkoutPageController();
		}
	});
};

rhit.main();
// API stuff below
function htmlToElement(html) { // From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

function checkTime(i) { //from https://www.w3schools.com/js/tryit.asp?filename=tryjs_timing_clock
	if (i < 10) {
		i = "0" + i
	}; // add zero in front of numbers < 10
	return i;
}

function startDate() { //from https://www.w3schools.com/js/tryit.asp?filename=tryjs_timing_clock
	var today = new Date();
	var weekday = new Array(7);
	weekday[0] = "Sunday";
	weekday[1] = "Monday";
	weekday[2] = "Tuesday";
	weekday[3] = "Wednesday";
	weekday[4] = "Thursday";
	weekday[5] = "Friday";
	weekday[6] = "Saturday";

	var month = new Array(12);
	month[0] = "January";
	month[1] = "February";
	month[2] = "March";
	month[3] = "April";
	month[4] = "May";
	month[5] = "June";
	month[6] = "July";
	month[7] = "August";
	month[8] = "September";
	month[9] = "October";
	month[10] = "November";
	month[11] = "December";

	var date = today.getDate();
	var d = weekday[today.getDay()];
	var m = month[today.getMonth()];
	m = checkTime(m);
	d = checkTime(d);
	document.getElementById('date').innerHTML =
		d + ", " + m + " " + date;
	// var t = setTimeout(startTime, 1000);
}

var Cal = function (divId) { //from https://codepen.io/xmark/pen/WQaXdv?editors=0010
	//Store div id
	this.divId = divId;

	// Days of week, starting on Sunday
	this.DaysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

	// Months, stating on January
	this.Months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	];

	// Set the current month, year
	var d = new Date();

	this.currMonth = d.getMonth();
	this.currYear = d.getFullYear();
	this.currDay = d.getDate();
};

// Goes to next month
Cal.prototype.nextMonth = function () {
	if (this.currMonth == 11) {
		this.currMonth = 0;
		this.currYear = this.currYear + 1;
	} else {
		this.currMonth = this.currMonth + 1;
	}
	this.showcurr();
};

// Goes to previous month
Cal.prototype.previousMonth = function () {
	if (this.currMonth == 0) {
		this.currMonth = 11;
		this.currYear = this.currYear - 1;
	} else {
		this.currMonth = this.currMonth - 1;
	}
	this.showcurr();
};

// Show current month
Cal.prototype.showcurr = function () {
	this.showMonth(this.currYear, this.currMonth);
};

// Show month (year, month)
Cal.prototype.showMonth = function (y, m) {
	var d = new Date(),
		// First day of the week in the selected month
		firstDayOfMonth = new Date(y, m, 1).getDay(),
		// Last day of the selected month
		lastDateOfMonth = new Date(y, m + 1, 0).getDate(),
		// Last day of the previous month
		lastDayOfLastMonth =
		m == 0 ? new Date(y - 1, 11, 0).getDate() : new Date(y, m, 0).getDate();

	var html = "<table>";

	// Write selected month and year
	html += "<thead><tr>";
	html += '<td colspan="7">' + this.Months[m] + " " + y + "</td>";
	html += "</tr></thead>";

	// Write the header of the days of the week
	html += '<tr class="days">';
	for (var i = 0; i < this.DaysOfWeek.length; i++) {
		html += "<td>" + this.DaysOfWeek[i] + "</td>";
	}
	html += "</tr>";

	// Write the days
	var i = 1;
	let old = 0;
	do {
		var dow = new Date(y, m, i).getDay();

		// If Sunday, start new row
		if (dow == 0) {
			html += "<tr>";
		}
		// If not Sunday but first day of the month
		// it will write the last days from the previous month
		else if (i == 1) {
			html += "<tr>";
			var k = lastDayOfLastMonth - firstDayOfMonth + 1;
			for (var j = 0; j < firstDayOfMonth; j++) {
				html += `<td class="not-current">` + k + "</td>";
				k++;
			}
		}

		// Write the current day in the loop
		let cal = new Date(y, m, i);
		let calY = cal.getFullYear();
		let calM = cal.getMonth();
		let chk = new Date();
		let chkY = chk.getFullYear();
		let chkM = chk.getMonth();
		let dayFormat = calY.toString() + checkTime(calM + 1).toString() + checkTime(i).toString();
		if (chkY == this.currYear && chkM == this.currMonth && i == this.currDay) {
			html += `<td id=${dayFormat} class="today">` + i + "</td>";
		} else {
			html += `<td id=${dayFormat} class="normal">` + i + "</td>";
			if (i != old) {
				$(document).on("click", `#${dayFormat}`, function () {
					// alert("The current day was clicked");
					console.log(`Clicked ${dayFormat}`);
				});
				old = i;
			}
		}
		// If Saturday, closes the row
		if (dow == 6) {
			html += "</tr>";
		}
		// If not Saturday, but last day of the selected month
		// it will write the next few days from the next month
		else if (i == lastDateOfMonth) {
			var k = 1;
			for (dow; dow < 6; dow++) {
				html += '<td class="not-current">' + k + "</td>";
				k++;
			}
		}

		i++;
	} while (i <= lastDateOfMonth);

	// Closes table
	html += "</table>";

	// Write HTML to the div
	document.getElementById(this.divId).innerHTML = html;
};

// On Load of the window
window.onload = function () {
	// Start calendar
	if (!document.querySelector("#mainPage")) {
		return;
	}
	var c = new Cal("divCal");
	c.showcurr();

	// Bind next and previous button clicks
	getId("btnNext").onclick = function () {
		c.nextMonth();
		rhit.MainPageController.populateExercisesOnCalendar();
	};
	getId("btnPrev").onclick = function () {
		c.previousMonth();
		rhit.MainPageController.populateExercisesOnCalendar();
	};
};

// Get element by id
function getId(id) {
	return document.getElementById(id);
}