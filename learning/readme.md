npm install -g expo-cli
expo init "projectName"

cd "projectName"
npm start web

npx create-expo-app app-name --template



## file structure

src/
│
├── screens/       → complete pages
├── components/    → reusable UI
├── navigation/    → screen navigation
├── context/       → shared state
├── hooks/         → reusable React logic
├── services/      → API/backend communication
├── utils/         → generic helper functions
│
└── App.tsx



# React Native and android

View: Basic container component used for layout and structure
Text: Used to display text content
Image: Displays images from local or remote sources.
ScrollView: Enables scrolling for large content.
FlatList: Efficiently renders large lists of data.
TextInput: Allows users to enter text.
Button: Used to trigger actions on user interaction.

sectionlist
Pressable
TouchableOpacity


* StyleSheet and Flexbox.


## expo
Expo is an open-source framework and platform for making universal native apps for Android, iOS, and the web with JavaScript and React.
In technical terms, it acts as a robust wrapper around React Native that provides a suite of tools, pre-configured libraries, and cloud services to streamline the entire development lifecycle—from project setup to app store deployment.

* navigation

import { useNavigation } from '@react-navigation/native';
const navigation = useNavigation();

navigation.navigate('Message', {
    message, // Pass the current value of 'message' to the 'Message' screen
});


import { useRoute } from '@react-navigation/native'; 
const route = useRoute();

<View style={styles.container}>
    <Text style={styles.title}>{route.params.message}</Text>
</View>


 const response = await fetch('https://reqres.in/api/posts', {
            method: 'POST', // Specify HTTP method as POST
            headers: {
                'Content-Type': 'application/json', // Set content type to JSON
                'x-api-key': 'reqres-free-v1'  // Add API key in the headers
            },
            body: JSON.stringify({ postName: 'React updates' }) // Send data in the request body
        });


        useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/users/1')
      .then(response => {
        console.log(response.data.name);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);



  var log = logger.createLogger(); 

	log.debug('I am a Debug log'); 
	log.info('I am a Info log'); 
	log.warn('I am a Warning log'); 
	log.error('I am a Error log');


### Thread
A thread is a sequence of instructions that the CPU executes. It is the smallest unit of execution within a program.

A thread is a component of a process, and a process is a program that is currently running.
Multiple threads can exist within a single process, allowing different tasks to run simultaneously.
Threads help improve performance by enabling parallel execution and smoother application behaviour.


JS thread
UI thread
Native module thread
Render thread




# features of saathi

auth  
ask type, feeling, freq, money spent, imapact


## Show progress
health improved
money saved
track progress and streak motivation

## distraction from craving using games

## companinon for help

help skip craving  
  
## location and map
alert when near a craving location 

## Doctor help

## Ai assistant for personal guidance

## Personalised plan model
for safely reduce caraving without sever withdrawal 




# Project Summary for React Native Interview

Saathi is a mobile health and recovery app built for users dealing with addiction recovery, with a companion-based support model. The app helps users complete onboarding, track recovery progress, access AI-generated plans, monitor risky behaviors, and stay connected with a companion or support system.

### What I built
- Onboarding flow for patient and companion roles
- Personalized recovery dashboard with progress and metrics
- AI-powered recovery plan generation and updates
- Rewards and motivation features
- Companion support features and shared patient tracking
- Location Shield feature to define risky places and trigger alerts when a user gets close
- Local persistence for user state and onboarding flow

### Tech stack
- React Native with Expo
- TypeScript
- React Navigation
- AsyncStorage for local persistence
- expo-location and expo-notifications for geo-aware safety alerts
- Backend: Node.js, Express, Prisma, PostgreSQL
- REST API integration using central API service layer

### React Native-specific strengths
- Built modular screens, services, and context providers for maintainable app structure
- Navigation things
- Managed app state with React Context for onboarding and user session data
- Implemented permission handling for location access and runtime notifications
- Added native map rendering with a fallback map strategy for Android
- Created background monitoring logic to detect proximity to risk zones
- Centralized API logic to keep networking clean and reusable
- Designed user flows for onboarding, hydration, and persistence across app restarts

### Why this project is strong for discussion
This project shows that I can work across:
- UI and business logic
- Navigation and activity, thread state passing to differnet component
- device permissions and native integrations
- API integration and backend collaboration
- state management and persistence
- user-centered product thinking with real-world safety features

### Short interview answer
“I built Saathi as a recovery-focused mobile app in React Native, combining onboarding, personalized tracking dashboard, AI recovery planning and assistant, and a safety feature that monitors risky locations using device GPS. The app uses context-based state management, local storage, and a backend API layer for data sync. A key challenge was integrating location permissions, background monitoring, and map-based user interactions while keeping the app reliable and user-friendly. This project demonstrates my ability to build practical, production-style React Native features with real-world device integration.”

### Quick talking points to mention
- “I handled native device features like location and notifications.”
- “I structured the app with reusable services and context.”
- “I worked with both frontend and backend data flows.”
- “I solved real-world UX challenges like onboarding persistence and permission gating.”
- “I implemented a complete user journey from onboarding to monitoring, tracking and assistant support.”


Saathi was a collaborative hackathon project, and we worked together across the frontend and backend rather than having completely isolated responsibilities. My primary involvement was on the React Native side. I worked on the application flow, navigation, Context-based state management, AsyncStorage persistence, API integration, and device-related features such as location and notifications. I also worked with the team while integrating and debugging different parts of the application.

One of the interesting parts was the Location Shield feature, where we used device location to identify when a user was approaching a configured risky area and then integrated that with the notification flow. The project gave me experience working with React Native beyond just UI development — particularly state management, persistence, permissions, native capabilities, and frontend-backend integration.

### Architecture

We separated the React Native application into screens, reusable components, navigation, context providers and service layers.
Screens were responsible primarily for composing the UI, while reusable components handled common UI elements. We used context providers for state that needed to be shared across multiple screens, such as onboarding or authentication-related information. API communication was separated into service functions instead of putting all networking logic directly into screens. This made the application easier to maintain and allowed us to keep the UI layer separate from backend communication.

For background location, the important distinction is that location tracking cannot depend on a screen remaining mounted. The operating system needs to provide background execution and location updates, and React Native/Expo can expose those native capabilities to JavaScript. The implementation also needs to account for permissions, battery consumption, lifecycle and Android's background execution restrictions

Background location requires appropriate runtime permissions and platform-specific configuration. The application should request only the minimum permission necessary and clearly explain to the user why location is required.




# questions


Explain to me how to create a color theme using context api

What is the difference between flatlist and scrollview when would you use one over the other

What are common performance issues and how to avoid them

Can you list any platform specific hurdles android specific or iOS



 𝗥𝗲𝗮𝗰𝘁 𝗡𝗮𝘁𝗶𝘃𝗲 (𝗖𝗼𝗿𝗲)
 • How does FlatList optimization work internally?
 • useCallback vs useMemo - when and why to use each
 • Handling large lists and pagination in production apps
 • How the Metro bundler works
 • Common causes of unnecessary re-renders
 • Managing environment configurations (dev / prod)


 ● 𝗝𝗮𝘃𝗮𝗦𝗰𝗿𝗶𝗽𝘁 (𝗜𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁 𝗳𝗼𝗿 𝗥𝗲𝗮𝗰𝘁 𝗡𝗮𝘁𝗶𝘃𝗲)
 • How the JavaScript event loop works in React Native
 • == vs === and real-world bugs
 • Promise vs async/await (under the hood)
 • Closures and memory leaks
 • Why immutability matters in state management


  𝗔𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲 & 𝗥𝗲𝗮𝗹-𝗪𝗼𝗿𝗹𝗱 𝗧𝗵𝗶𝗻𝗸𝗶𝗻𝗴
 • Structuring a scalable React Native project
 • Redux Toolkit vs Context - practical use cases
 • Debugging production crashes
 • Designing mobile-friendly APIs
 • Performance optimization for low-end devices





# what to prepare ####################################

 Yes — **definitely.** I would not prepare only Saathi.

Looking at your resume, the interviewer can easily jump between **Saathi → DrawMeet → NoteBrain → Internship → CS fundamentals → Android/React Native**. 

For a 1-hour interview, I would prepare like this:

### 1. Saathi — highest priority

Expect **10–15 questions**:

* What is Saathi?
* Why did you build it?
* Your exact contribution?
* Architecture?
* Why React Native?
* Why Expo?
* Navigation?
* AsyncStorage?
* Android APIs?
* API communication?
* Authentication?
* PostgreSQL/Prisma?
* AI/LangGraph?
* Biggest challenge?
* How would you improve it?

### 2. DrawMeet — very likely

Your resume has several technically interesting points, so they can dig into it. 

Prepare:

* What is DrawMeet?
* Why Socket.IO?
* How does real-time collaboration work?
* How do multiple users draw simultaneously?
* What is event sourcing?
* Why store actions instead of the entire canvas?
* How does undo/redo work?
* How did you handle synchronization?
* What happens if two users modify the same object?
* How does presence/live cursor work?
* How did authentication work?
* Why MongoDB?
* How does AI diagram generation work?
* What was the hardest technical problem?

**This project can actually impress them**, because it demonstrates real-time systems and frontend engineering.

### 3. NoteBrain — medium priority

Your resume mentions Docker sandboxing, GitHub OAuth, IndexedDB, real-time sync and conflict resolution. 

Prepare:

* What is NoteBrain?
* Why IndexedDB?
* Why GitHub OAuth?
* How did synchronization work?
* What is conflict resolution?
* Why Docker?
* How did your code execution sandbox work?
* How did you prevent malicious code from affecting the host?
* Why timeout the execution?
* How did you support multiple languages?

The **Docker/code execution question is particularly likely** because it's an interesting engineering problem.

### 4. Indux Solar internship — very important

Your resume says you worked with Next.js, React, Node.js, Express, MongoDB, REST APIs, TypeScript, PostgreSQL, Redis, Docker, AWS and CI/CD. 

### Prepare:

* What did you actually build?
* What was your role?
* Frontend/backend interaction?
* REST API design?
* Authentication?
* PostgreSQL vs MongoDB?
* Why Redis?
* What did you use Redis for?
* Why Docker?
* What did you deploy on AWS?
* How did CI/CD work?
* Biggest production issue?
* How did you collaborate with other developers?

**Be particularly precise about your personal contribution.** Interviewers often detect resume exaggeration here.

---

## 5. Then your general technical questions

### React / React Native

* Props vs state
* `useState`
* `useEffect`
* `useMemo`
* `useCallback`
* `useRef`
* Context API
* component re-rendering
* React reconciliation
* FlatList
* performance optimization

### JavaScript

* `var/let/const`
* closures
* hoisting
* event loop
* Promise
* async/await
* callbacks
* `map/filter/reduce`
* shallow vs deep copy
* debounce/throttle

### Backend

* REST
* HTTP methods
* status codes
* JWT
* authentication vs authorization
* middleware
* error handling
* API security

### Database

* SQL JOIN
* indexes
* transactions
* ACID
* normalization
* PostgreSQL vs MongoDB
* Redis

### CS

* OOP
* OS basics
* DBMS
* networking
* basic DSA

Your resume explicitly lists DSA, OS, DBMS, Computer Networks and OOP as coursework, so these are fair game. 

---




# The most important thing

For **your particular resume**, I'd divide preparation roughly:

**Saathi — 30%**
**Android + React Native — 25%**
**DrawMeet — 15%**
**Internship — 10%**
**NoteBrain — 5%**
**JS/TS/Backend/DB — 10%**
**CS/DSA — 5%**

And don't prepare only questions. For **each project**, know this sequence:

> **What → Why → Architecture → My contribution → Technical decisions → Difficult problem → Solution → Result → What I'd improve**

If you can explain **Saathi, DrawMeet, NoteBrain and Indux Solar** at that level, you're covered for most project-based questioning.


-------







# Do

What → Why → Architecture → My contribution → Technical decisions → Difficult problem → Solution → Result → What I'd improve


saathi


* What is Saathi?
* Why did you build it?
* Your exact contribution?
* Architecture?
* Why React Native?
* Why Expo?
* Why not redux
* Navigation?
* AsyncStorage?
* Android APIs?
* API communication?
* Authentication?

>  left to study
* PostgreSQL/Prisma?
* AI/LangGraph?
* Biggest challenge?
* How would you improve it?


5. Debugging/integration

Helping teammates debug issues
Connecting different pieces of the application
Fixing integration problems





# Concepts Learned




## Flow and architecture

### 1. The JS Thread

Responsibilities:

* Trigger: The JS thread executes your business logic. It handles the API response data or intercepts the user action event passed over from the native side to update the React state.

* Reconciliation: The JS engine (Hermes) runs here. It executes React's diffing algorithm, compares the old Virtual DOM with the new Virtual DOM, and calculates the required UI changes.


### 2. The Background Thread (Shadow Thread)

Responsibilities: Shadow tree

* Commit Phase: Once reconciliation finishes, Fabric creates the C++ Shadow Tree on this thread. The Yoga layout engine runs exclusively here, calculating the exact device-specific physical boundaries (width, height, paddings, margins) using Flexbox constraints. This keeps heavy layout math completely off the main UI thread.

### 3. The Main UI Thread (Native Thread).

Responsibilities: Native view hierarchy

* Mutation: This thread receives the fully calculated layout instructions from the Shadow Thread. Fabric uses these instructions to instantly create, move, update, or delete actual platform elements (like iOS UIView or Android ViewGroup).

* Handling Synchronous JSI Updates: When you use JSI for high-performance interactions (like gestures or animations), JavaScript directly calls C++ host objects. Fabric executes these critical mutations directly on the Main UI Thread synchronously, completely skipping asynchronous thread hopping.

### 4. The OS Render Thread (Android-specific context)

Responsibilities: Native rendering

* Drawing Pixels: Once the Main UI Thread finishes mutating the native view hierarchy, this low-level operating system thread takes the final UI blueprints and issues the GPU commands to actually paint the colors and pixels onto your physical smartphone screen.



## Navigation

1. Stack Navigator: 

  Pushes new screens on top of a stack and pops them off when going back. It is ideal for linear user flows like Home → Product Details → Checkout.

2. Tab Navigator: 

  Displays tabs at the bottom or top of the screen. This allows users to switch between major sections of the app instantly.

3. Drawer Navigator: 

  Renders a hidden side menu that slides out when swiped or triggered via a hamburger menu


### Stack navigation #############################

npm install @react-navigation/native
npm install @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context


> import { useNavigation } from '@react-navigation/native';
> import { NavigationContainer } from '@react-navigation/native';
> import { createNativeStackNavigator } from '@react-navigation/native-stack';


const Stack = createNativeStackNavigator<LocationShieldStackParamList >();
const navigation = useNavigation<NavProp>();

<NavigationContainer>
  <Stack.Navigator initialRouteName="Home">
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Overview' }} />
    <Stack.Screen name="Details" component={DetailsScreen} />
  </Stack.Navigator>
</NavigationContainer>


1. navigation.navigate('ScreenName', { params })     //  Moves to the target screen and passes optional data
2. navigation.push('ScreenName')    // Forces a new instance of the screen onto the stack, even if you are already on it
3. navigation.goBack()      // Programmatically pops the current screen off the stack.(not the parent navigator or the caller)
4. navigation.replace('ScreenName')   // replace current screen (no back) with ScreenName  (pop and push)
5. navigation.getParent()  // gives reference to parent navigator that confiugred the stack for the current screen


<!-- 
type for auto completion of the screenames and for error checking
export type LocationShieldStackParamList = {
  Intro: undefined;
  Permission: undefined;
  RiskZones: undefined;
  AllSet: undefined;
}; -->


### Tab navigation #############################

npm install @react-navigation/bottom-tabs

> import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}


### Drawer Navigation ###########################

npm install @react-navigation/drawer react-native-gesture-handler react-native-reanimated

> import 'react-native-gesture-handler';
> import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

export function AppDrawer() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}


## Location 


### Why Background GPS is Difficult

Android prioritizes battery life, privacy, and performance over your app's features. To pass an interview, you must explain the specific hurdles Android puts in place:

1. OS-Level Throttling (Doze Mode & App Standby)Android uses Doze Mode to preserve battery when a device is stationary. It restricts apps from accessing the network and deferring background tasks to specific, infrequent "maintenance windows." If your app tries to ping GPS every 10 seconds in the background, Android will batch or completely ignore those requests.

2. Strict Permission Architecture

Android requires explicit, multi-tiered consent for location tracking:


* Foreground: ACCESS_FINE_LOCATION (precise GPS) or ACCESS_COARSE_LOCATION (cellular/Wi-Fi triangulation).

* Background: ACCESS_BACKGROUND_LOCATION (introduced in Android 10).

* The Catch: You cannot request background location directly via a simple pop-up. The user must be explicitly guided into the Android System Settings menu to manually select "Allow all the time". Google Play also strictly reviews apps using this permission.


3. Execution Mechanisms (Foreground Services)
Because the standard JavaScript runtime pauses when minimized, you must decouple your location tracking from the UI. You achieve this using an Android Foreground Service.This is a background task that displays a non-dismissible notification to the user.
* The notification satisfies Android’s privacy rules by making the user fully aware that the app is actively pulling GPS data in the background.



4. Memory Management (The Low Memory Killer)If the user opens a resource-heavy app (like a game or the camera) while your app is in the background, Android’s Low Memory Killer (LMK) will start reclaiming RAM. Apps sitting in the background without a Foreground Service are the very first targets to be killed





### How to Implement This in React Native / Expo

An interviewer will want to know how you actually build this. In a standard Expo or React Native workflow, you rely on native modules to bridge the gap:

* Expo Location Task Manager: You register a named background task using TaskManager.defineTask(). This runs your JavaScript code in a separate context even when the React UI is unmounted.

* Persistent Notifications: You configure Location.startLocationUpdatesAsync() with foreground service options, passing a custom title and body text for the mandatory notification.


## Why React Native?  Why Expo?

React Native is the framework/platform approach.
* android an 

Expo is a toolchain/platform built around React Native that simplifies development, native configuration, and builds.

Expo provides
* tooling for creating and running React Native applications.
* provides APIs/packages for things like:
      location
      camera
      notifications
      sensors
      secure storage
      etc.

* Android/iOS builds.
* configuration of native capabilities.


## Why Context and not redux

only 4 context providers needed with minimal states

> context 
For Saathi, the global state was relatively limited and mostly related to authentication, onboarding, user roles, and shared app data. Context was sufficient to avoid prop drilling without introducing Redux's additional boilerplate. I preferred keeping the architecture simple. If the application's global state became more complex or highly interconnected, I would consider Redux Toolkit.

* limitation
1. many re-renders



> redux best for large code base.
Avoids unnecessary re-renders

best for:
Redux DevTools, complex global state, many independent state updates, complex state transitions or requirements such as centralized debugging and middleware

store
actions
reducers
selectors
middleware

## Langs for development

### NATIVE
Android → Kotlin
iOS     → Swift
### CROSS-PLATFORM
React Native → JavaScript/TypeScript
Flutter      → Dart