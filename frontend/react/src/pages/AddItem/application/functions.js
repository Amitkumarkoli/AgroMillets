import { toast } from "react-toastify";
import axios from "axios";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import storage from "../../../main";

async function handleUpload(file) {
  if (!file) {
    alert("Please choose a file first!");
  }

  const storageRef = ref(storage, `/files/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  try {
    // Wait for the upload task to complete
    await new Promise((resolve, reject) => {
      uploadTask.on("state_changed", null, reject, () => resolve());
    });

    // Get the download URL
    const url = await getDownloadURL(uploadTask.snapshot.ref);
    console.log(url);
    return url;
  } catch (error) {
    console.error(error);
  }
}

// Save data to backend

export async function addItem(data) {
  const { listedBy, name, description, price, file } = data;

  try {
    const img = await handleUpload(file);

    const res = await axios.post(
      import.meta.env.VITE_API_URL + "/list/addItem",
      {
        listedBy: listedBy,
        name: name,
        description: description,
        images: [img],
        price: price,
        comments: [],
      }
    );

    console.log(res);

    if (res.data.statusCode == 200) {
      toast.success(res.data.message);
      return true;
    } else {
      toast.error(res.data.message);
      return false;
    }
  } catch (err) {
    console.log(err);
    toast.error("Error uploading image");
    return false;
  }
}
