import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Post from '../components/Post';
import { usePosts } from '../contexts/posts';

export default function MainScreen() {
  const { posts } = usePosts();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {posts.length == false ?
        <FlatList
          style={styles.feed}
          data={posts}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <Post {...item} />}
          keyExtractor={(item) => item.id}
        /> :
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