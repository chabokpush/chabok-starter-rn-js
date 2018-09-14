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
            senderID: "YOUR_SENDER_ID",
            permissions: {
                alert: true,
                badge: true,
                sound: true
            },
            popInitialNotification: true,
            requestPermissions: true,
        });
    }

    //Register
    registerButtonTapped() {
        const {userId} = this.state;
        if (userId) {
            this.chabok.register(userId);
        } else {
            console.warn('The userId is undefined');
        }
    }
    unregisterButtonTapped() {
        this.chabok.unregister();
    }
    subscribeButtonTapped() {
        if (this.state.channel) {
            this.chabok.subscribe(this.state.channel);
        } else {
            console.warn('The channel name is undefined');
        }
    }
    unsubscribeButtonTapped() {
        if (this.state.channel) {
            this.chabok.unSubscribe(this.state.channel);
        } else {
            console.warn('The channel name is undefined');
        }
    }

    //Publish
    publishButtonTapped() {
        var msg = {
            channel: "default",
            user: this.state.userId,
            content: this.state.messageBody
        };
        this.chabok.publish(msg)
    }
    publishEventButtonTapped() {
        this.chabok.publishEvent('batteryStatus', {'state':'charging'});
    }

    //Tag
    addTagButtonTapped() {
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
    removeTagButtonTapped() {
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
    addToCartTrackButtonTapped() {
        this.chabok.track('addToCart',{'order':'200'});
    }
    purchaseTrackButtonTapped() {
        this.chabok.track('purchase',{'price':'15000'});
    }
    commentTrackButtonTapped() {
        this.chabok.track('comment',{'podtId':'1234555677754d'});
    }
    likeTrackButtonTapped() {
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
                        width="80%"
                        onChangeText={(text) => this.setState({userId:text})}>{this.getUserId()}</TextInput>
                    <TextInput
                        style={styles.input}
                        width="20%"
                        placeholder="Channel name"
                        onChangeText={(text) => this.setState({channel:text})}/>
                </View>

                <View style={styles.nestedButtonView}>
                    <Button
                        style={styles.button}
                        title="Register"
                        onPress={()=>this.registerButtonTapped()}/>
                    <Button
                        style={styles.button}
                        title="Unregister"
                        onPress={()=>this.unregisterButtonTapped()}/>
                    <Button
                        style={styles.button}
                        title="Subscribe"
                        onPress={()=>this.subscribeButtonTapped()}/>
                    <Button
                        style={styles.button}
                        title="Unsubscribe"
                        onPress={()=>this.unsubscribeButtonTapped()}/>
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
                        onPress={()=>this.publishButtonTapped()}/>
                    <Button
                        style={styles.button}
                        title="PublishEvent"
                        onPress={()=>this.publishEventButtonTapped()}/>
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
                        onPress={()=>this.addTagButtonTapped()}/>
                    <Button
                        style={styles.button}
                        title="RemoveTag"
                        onPress={()=>this.removeTagButtonTapped()}/>
                </View>
                <View style={styles.nestedButtonView}>
                    <Text>Track user: </Text>
                </View>
                <View style={styles.nestedButtonView}>
                    <Button style={styles.button} title="AddToCart" onPress={()=>this.addToCartTrackButtonTapped()}/>
                    <Button style={styles.button} title="Purchase" onPress={()=>this.purchaseTrackButtonTapped()}/>
                    <Button style={styles.button} title="Comment" onPress={()=>this.commentTrackButtonTapped()}/>
                    <Button style={styles.button} title="Like" onPress={()=>this.likeTrackButtonTapped()}/>
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
        marginBottom: 0
    }
});