import { View, StyleSheet, Text, TouchableOpacity, FlatList, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Post from '../components/Post';
import { usePosts } from '../contexts/posts';
import { useState, useEffect } from 'react';

async function getRealsOld() {
  const url = "http://192.168.1.22:5296/api/Real/01945b3a-e700-76c4-9a73-bdfe0bce6ce3"
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.error(error.message);
  }
}



export default function MainScreen() {
  const { posts } = usePosts();
  const navigation = useNavigation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getReals = async () => {
    //const url = "http://192.168.1.22:5296/api/Real/01947a5a-20b0-790b-b166-449536fe3a87"
    const url = "http://192.168.1.22:5296/api/User/3434d184-7e1d-4f22-a682-8227e2a78096/reals"
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      
      const json = await response.json();
      console.log("fetchImage json responsel:");
      console.log(json);
      console.log("Date:");
      console.log(new Date(json[0].createdAt));
      // TODO handle single Real 
      json.sort((a, b) => {return new Date(b.createdAt) - new Date(a.createdAt)});
      //json.sort();
      setImages(prevImages => {
        // Filter out images that already exist based on the id
        const newImages = json.map(post => ({
          id: post.postId,
          back: post.backImage,
          front: post.frontImage,
          time: post.createdAt
        }));
        //const newImage = {
        //  id: json.postId,
        //  back: json.backImage,
        //  front: json.frontImage
        //};
      
        // Combine the previous images with the new images, ensuring no duplicates
        // TODO sort here so new images are added in correct order
        const updatedImages = [
          ...prevImages,
          ...newImages.filter(newImage => !prevImages.some(existingImage => existingImage.id === newImage.id))
          //...(!prevImages.some(existingImage => existingImage.id === newImage.id) ? [] : [newImage])
        ];
      
        return updatedImages;
        //return [newImage];
      });
      console.log("images:");
      console.log(images);
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    getReals();
    setLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      {images.length > 0 ? (
        <>
          {refreshing ? <ActivityIndicator /> : null}
          <FlatList
            style={styles.feed}
            data={images}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => 
              <Post 
                id={1}
                user={{ handle: "peter", profile: "https://picsum.photos/768/1024/?random=99" }}
                likes={42}
                location={{city: "Berlin", state: "DE"}}
                image={{
                  front: "http://192.168.1.22:5296/uploads/".concat(item.front),
                  back: "http://192.168.1.22:5296/uploads/".concat(item.back)
                }}
                time={item.time}
              />
            }
            keyExtractor={(item) => item.time}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => getReals()}/>
            }
          /> 
        </>
      ) :
        <View style={styles.noPosts}>
          <Text style={styles.noPostsText}>There seems to be no posts so far, you should make the first one!</Text>
          <TouchableOpacity onPress={() => navigation.push('Camera')} style={styles.noPostsButton}>
            <Text style={styles.noPostsButtonText}>Post</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => 
              { 
                //const url = "https://192.168.1.22:7289/api/User/60a421a7-773a-4b23-9b95-8b03a21a6b22";
                const url = "http://192.168.1.22:5296/api/User/60a421a7-773a-4b23-9b95-8b03a21a6b22";
                //const url = "https://httpbin.org/get"
                try {
                  const response = await fetch(url);
                  if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                  }
              
                  const json = await response.json();
                  console.log(json);
                } catch (error) {
                  console.error(error.message);
                }
              }
            } style={styles.noPostsButton}>
            <Text style={styles.noPostsButtonText}>Test GET User by id request</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => getReals()} style={styles.noPostsButton}>
            <Text style={styles.noPostsButtonText}>Get some damn Reals you fool</Text>
          </TouchableOpacity>
        </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  feed: {
    paddingTop: 115,
    width: "100%"
  },
  noPosts: {
    width: 300,
    alignItems: "center"
  },
  noPostsText: {
    textAlign: "center",
    fontFamily: "Manrope_500Medium",
    fontSize: 14
  },
  noPostsButton: {
    marginTop: 30,
    backgroundColor: "#000",
    borderRadius: 8
  },
  noPostsButtonText: {
    color: "#fff",
    fontFamily: "Manrope_700Bold",
    paddingHorizontal: 25,
    paddingVertical: 10
  }
});