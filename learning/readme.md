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
