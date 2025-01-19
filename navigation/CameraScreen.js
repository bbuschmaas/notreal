import { StyleSheet, View, useWindowDimensions, TouchableOpacity, Image } from 'react-native'
import { Camera, CameraType, CameraPictureOptions } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import { usePosts } from '../contexts/posts'
import { useProfile } from '../contexts/profile';
import { useNavigation } from '@react-navigation/native';

import Send from '../assets/icons/send.svg'
import Rotate from '../assets/icons/rotate.svg'

export default function CameraScreen() {
  const [status, requestPermission] = Camera.useCameraPermissions();
  const [type, setType] = useState(CameraType.back);
  const [pictures, setPictures] = useState({ [CameraType.front]: null, [CameraType.back]: null })
  const cameraRef = useRef();
  const { width } = useWindowDimensions();
  const { posts, setPosts } = usePosts();
  const height = Math.round((width * 16) / 9);
  const otherPicture = pictures[otherSide()]
  const navigation = useNavigation();
  const profile = useProfile()
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => { requestPermission() }, []);

  if (!status || !status.granted) {
    return <View />;
  }

  function otherSide() {
    if (type == CameraType.back) {
      return CameraType.front
    }

    return CameraType.back
  }

  function swapCamera() {
    setType(otherSide())
  }

  function submitPicture() {
    const post = {
      "id": posts.length,
      "user": {
        "handle": profile.handle,
        "profile": profile.profile
      },
      "likes": 0,
      "dislikes": 0,
      "location": {
        "city": profile.location.city,
        "state": profile.location.state
      },
      "image": {
        "front": pictures[CameraType.front].uri,
        "back": pictures[CameraType.back].uri
      }
    }

    setPosts([post, ...posts])
    navigation.navigate('Main')
  }

  async function uploadRealPictures(back_img, front_img) {
    try {
      const formData = new FormData();
      formData.append("UserId", "3434d184-7e1d-4f22-a682-8227e2a78096");
      formData.append("Caption", "First be real crated by single api call from App");
      
      formData.append("back_file", {
        uri: back_img.uri,
        name: "back_img.jpg",
        type: "image/jpeg",
      });
      formData.append("front_file", {
        uri: front_img.uri,
        name: "front_img.jpg",
        type: "image/jpeg",
      });

      console.log("picture uris: ", back_img.uri, front_img.uri);
  
      const response = await fetch("http://192.168.1.22:5296/api/Real", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        console.log("response was not ok. response: ", response);
        throw new Error("Failed to upload images");
      }
  
      const data = await response.json();
      console.log("Upload successful:", data);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  }

  function hasBothPictures() {
    return pictures[CameraType.front] !== null && pictures[CameraType.back] !== null;
  }

  async function takePicture() {
    const picture = await cameraRef.current.takePictureAsync();
    await cameraRef.current.resumePreview();
    setCameraReady(false);

    setPictures({ ...pictures, [type]: picture });
    swapCamera();

    //uploadPicture(picture);
  }

  async function takeRealPictures() {
    try {
      const cam_options = {};

      setType(CameraType.back);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const back_img = await cameraRef.current.takePictureAsync(cam_options);
  
      setType(CameraType.front);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const front_img = await cameraRef.current.takePictureAsync(cam_options);

      setType(CameraType.back);
      console.log("img uris: ", back_img.uri, front_img.uri);
      await uploadRealPictures(back_img, front_img);
      navigation.navigate('Main')
  
  
    } catch (error) {
      console.error("Error taking pictures:", error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          onCameraReady={() => setCameraReady(true)}
          ref={cameraRef}
          ratio="16:9"
          style={{ width: "100%", height }}
          type={type}
        >
          {otherPicture !== null && (
            <Image
              source={{ uri: otherPicture.uri }}
              style={[styles.image, { width: 0.36 * width, height: 0.36 * height }]}
            />
          )}
        </Camera>
      </View>
      <View style={styles.toolsContainer}>
        <TouchableOpacity onPress={takeRealPictures} style={styles.take} />
      </View>
    </View>
  )
}
//<TouchableOpacity onPress={swapCamera} style={[styles.secondary, { marginRight: 20 }]}>
//  <Rotate color="white" width={35} height={35} />
//</TouchableOpacity>
//<TouchableOpacity onPress={takePicture} style={styles.take} />
//<TouchableOpacity
//  disabled={!hasBothPictures()}
//  onPress={submitPicture}
//  style={[styles.secondary, {
//    marginLeft: 20,
//  }]}>
//  <Send color={hasBothPictures() ? "white" : "#868e96"} width={35} height={35} />
//</TouchableOpacity>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000"
    // alignItems: "center"
  },
  cameraContainer: {
    borderRadius: 34,
    overflow: 'hidden'
  },
  image: {
    position: 'absolute',
    left: 20,
    top: 40,
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "black"
  },
  toolsContainer: {
    marginTop: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center"
  },
  take: {
    backgroundColor: '#FA5252',
    borderRadius: 99,
    width: 70,
    height: 70
  },
  secondary: {
    backgroundColor: '#343a40',
    borderRadius: 16,
    padding: 8,
  }
});