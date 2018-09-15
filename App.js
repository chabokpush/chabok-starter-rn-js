import React from 'react';
import chabokpush from 'chabokpush-rn';
import {StyleSheet, Button, Text, View, TextInput} from 'react-native';

const PushNotification = require('react-native-push-notification');
export default class App extends React.Component {

    constructor(){
        super();

        this.state = {
            tagName: 'FREE',
            userId: undefined,
            channel: undefined,
            connectionColor: 'red',
            messageReceived: undefined,
            connectionState: 'Disconnected',
            messageBody: 'Hello world Message'
        };
    }

    //Init
    componentDidMount(){
        this.initChabok();
        this.initPushNotification();
    }

    initChabok() {
        const authConfig = {
            devMode: true,
            appId: 'chabok-starter',
            username: 'chabok-starter',
            password: 'chabok-starter',
            apiKey: '70df4ae2e1fd03518ce3e3b21ee7ca7943577749'
        };
        const options = {
            silent: true
        };
        this.chabok = new chabokpush(authConfig, options);

        this.chabok.on('message', msg => {
            var phone = msg && msg.publishId && msg.publishId.split('/')[0];
            if (!phone) {
                phone = msg.channel.split('/')[0];
            }
            this.sendLocalPushNotification(msg,phone);
            var messageJson = this.getMessages() + JSON.stringify(msg);
            this.setState({messageReceived: messageJson});
        });
        this.chabok.on('connecting', _ => {
            this.setState({
                connectionColor: 'yellow',
                connectionState: 'Connecting'
            })
        });

        this.chabok.on('disconnected', _ => {
            this.setState({
                connectionColor: 'red',
                connectionState: 'Disconnected'
            })
        });
        this.chabok.on('connected', _ => {
            this.setState({
                connectionColor: 'green',
                connectionState: 'Connected'
            })
        });

        this.chabok.getUserId()
            .then(res => {
                if (res) {
                    this.setState({userId:res});
                    this.chabok.register(res);

                }
            })
            .catch();
    }

    initPushNotification() {
        PushNotification.configure({
            onRegister:  (token)=> {
                if(Object.keys(token)){
                    this.chabok.setPushNotificationToken(token.token)
                }
            },
            // ANDROID ONLY: (optional) GCM Sender ID.
            senderID: "339811759516",
            permissions: {
                alert: true,
                badge: true,
                sound: true
            },
            popInitialNotification: true,
            requestPermissions: true,
        });
    }

    sendLocalPushNotification(msg, user) {
        var notifObject = {
            show_in_foreground: true,
            local_notification: true,
            priority: "high",
            /* Android Only Properties */
            ticker: "My Notification Ticker", // (optional)
            autoCancel: true, // (optional) default: true
            largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
            smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
            bigText: msg.content, // (optional) default: "message" prop
            color: "red", // (optional) default: system default
            vibrate: true, // (optional) default: true
            vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
            group: "group", // (optional) add group to message
            ongoing: false, // (optional) set whether this is an "ongoing" notification
            title: `New message from ${user}`, // (optional, for iOS this is only used in apple watch, the title will be the app name on other iOS devices)
            message: msg.content, // (required)
            playSound: true, // (optional) default: true
            soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        };
        alert(JSON.stringify(notifObject));
        PushNotification.localNotification(notifObject);
    }

    //Register
    onRegisterTapped() {
        const {userId} = this.state;
        if (userId) {
            this.chabok.register(userId);
        } else {
            console.warn('The userId is undefined');
        }
    }
    onUnregisterTapped() {
        this.chabok.unregister();
    }
    onSubscribeTapped() {
        if (this.state.channel) {
            this.chabok.subscribe(this.state.channel);
        } else {
            console.warn('The channel name is undefined');
        }
    }
    onUnsubscribeTapped() {
        if (this.state.channel) {
            this.chabok.unSubscribe(this.state.channel);
        } else {
            console.warn('The channel name is undefined');
        }
    }

    //Publish
    onPublishTapped() {
        var msg = {
            channel: "default",
            user: this.state.userId,
            content: this.state.messageBody
        };
        this.chabok.publish(msg)
    }
    onPublishEventTapped() {
        this.chabok.publishEvent('batteryStatus', {'state':'charging'});
    }

    //Tag
    onAddTagTapped() {
        if (this.state.tagName) {
            this.chabok.addTag(this.state.tagName)
                .then(res => {
                    alert(this.state.tagName + ' tag was assign to ' + this.getUserId() + ' user with '+ res.count + ' devices');
                })
                .catch(err => console.warn("An error happend adding tag ..."));
        } else {
            console.warn('The tagName is undefined');
        }
    }
    onRemoveTagTapped() {
        if (this.state.tagName) {
            this.chabok.removeTag(this.state.tagName).then(res => {
                alert(this.state.tagName + ' tag was removed from ' + this.getUserId() + ' user with '+ res.count + ' devices');
            })
                .catch(err => console.warn("An error happend removing tag ..."));;
        } else {
            console.warn('The tagName is undefined');
        }
    }

    //Track
    onAddToCartTrackTapped() {
        this.chabok.track('addToCart',{'order':'200'});
    }
    onPurchaseTrackTapped() {
        this.chabok.track('purchase',{'price':'15000'});
    }
    onCommentTrackTapped() {
        this.chabok.track('comment',{'podtId':'1234555677754d'});
    }
    onLikeTrackTapped() {
        this.chabok.track('like',{'podtId':'1234555677754d'});
    }

    getUserId() {
        if(this.state.userId){
            return this.state.userId;
        }
        return '';
    }

    getMessages() {
        if (this.state.messageReceived) {
            return this.state.messageReceived + '\n --------- \n\n';
        }
        return '';
    }

    getTagName() {
        if (this.state.tagName){
            return this.state.tagName;
        }
        return '';
    }

    getMessageBody() {
        if (this.state.messageBody){
            return this.state.messageBody;
        }
        return '';
    }
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.nestedButtonView} marginTop={-10}>
                    <View style={styles.circleView} backgroundColor={this.state.connectionColor}/>
                    <Text>{this.state.connectionState}</Text>
                </View>
                <View style={styles.nestedButtonView}>
                    <TextInput
                        style={styles.input}
                        placeholder="User id"
                        width="60%"
                        onChangeText={(text) => this.setState({userId:text})}>{this.getUserId()}</TextInput>
                    <TextInput
                        style={styles.input}
                        width="40%"
                        placeholder="Channel name"
                        onChangeText={(text) => this.setState({channel:text})}/>
                </View>

                <View style={styles.nestedButtonView}>
                    <Button
                        style={styles.button}
                        title="Register"
                        onPress={()=>this.onRegisterTapped()}/>
                    <Button
                        style={styles.button}
                        title="Unregister"
                        onPress={()=>this.onUnregisterTapped()}/>
                    <Button
                        style={styles.button}
                        title="Subscribe"
                        onPress={()=>this.onSubscribeTapped()}/>
                    <Button
                        style={styles.button}
                        title="Unsubscribe"
                        onPress={()=>this.onUnsubscribeTapped()}/>
                </View>

                <View style={styles.nestedButtonView}>
                    <TextInput
                        style={styles.input}
                        onChangeText={(text) => this.setState({messageBody:text})}
                        width="100%">{this.getMessageBody()}</TextInput>
                </View>
                <View style={styles.nestedButtonView}>
                    <Button
                        style={styles.button}
                        title="Publish"
                        onPress={()=>this.onPublishTapped()}/>
                    <Button
                        style={styles.button}
                        title="PublishEvent"
                        onPress={()=>this.onPublishEventTapped()}/>
                </View>
                <View style={styles.nestedButtonView}>
                    <TextInput
                        style={styles.input}
                        placeholder='Tag name'
                        onChangeText={(text) => this.setState({tagName:text})}
                        width='100%'>{this.getTagName()}</TextInput>
                </View>
                <View style={styles.nestedButtonView}>
                    <Button
                        style={styles.button}
                        title="AddTag"
                        onPress={()=>this.onAddTagTapped()}/>
                    <Button
                        style={styles.button}
                        title="RemoveTag"
                        onPress={()=>this.onRemoveTagTapped()}/>
                </View>
                <View style={styles.nestedButtonView}>
                    <Text>Track user: </Text>
                </View>
                <View style={styles.nestedButtonView}>
                    <Button style={styles.button} title="AddToCart" onPress={()=>this.onAddToCartTrackTapped()}/>
                    <Button style={styles.button} title="Purchase" onPress={()=>this.onPurchaseTrackTapped()}/>
                    <Button style={styles.button} title="Comment" onPress={()=>this.onCommentTrackTapped()}/>
                    <Button style={styles.button} title="Like" onPress={()=>this.onLikeTrackTapped()}/>
                </View>
                <View>
                    <Text style={styles.textView}>{this.getMessages()}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingRight: 12,
        paddingLeft: 12,
        paddingBottom: 12,
        width: '100%',
    },
    nestedButtonView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    circleView:{
        width: 15,
        height: 15,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 10,
        marginLeft: 4
    },
    button: {
        padding: 2
    },
    textView:{
      borderColor: 'rgba(127,127,127,0.3)',
        backgroundColor: 'rgba(127,127,127,0.06)',
        width: '100%',
        height: '70%',
    },
    input: {
        padding: 4,
        height: 40,
        borderColor: 'rgba(127,127,127,0.3)',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 0,
        marginRight: 5,
        marginLeft: 0
    }
});