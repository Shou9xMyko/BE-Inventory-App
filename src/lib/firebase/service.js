const {
  collection,
  getDocs,
  getDoc,
  getFirestore,
  deleteDoc,
  doc,
  where,
  query,
  updateDoc,
} = require("@firebase/firestore");
const app = require("./init");
const { addDoc } = require("firebase/firestore");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} = require("firebase/storage");

const fireStore = getFirestore(app);
const storage = getStorage(app);

const Login = async (userData, collectionName) => {
  const q = query(
    collection(fireStore, collectionName),
    where("email", "==", userData.email),
    where("password", "==", userData.password)
  );

  const snapShot = await getDocs(q);

  const data = snapShot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (data[0]) {
    const userEmailAndStatus = {
      email: data[0].email,
      status: true,
    };
    return userEmailAndStatus;
  } else {
    return false;
  }
};

const GetProduct = async (collectionName) => {
  try {
    const snapShot = await getDocs(collection(fireStore, collectionName));

    const data = snapShot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return data;
  } catch (error) {
    throw error;
  }
};

const AddProduct = async (data, images, collectionName, res) => {
  try {
    // upload images
    const storageRef = ref(
      storage,
      `product/${images.originalname}_${data.id}`
    );

    const collectionRef = collection(fireStore, collectionName);

    const snapShot = await uploadBytesResumable(storageRef, images.buffer, {
      contentType: images.mimetype,
    });

    const downloadUrl = await getDownloadURL(snapShot.ref);

    const dataToAdd = {
      id: data.id,
      product_name: data.product_name,
      product_price: parseInt(data.product_price),
      product_stock: parseInt(data.product_stock),
      product_category: data.product_category,
      product_unit: data.product_unit,
      product_expired: data.product_expired,
      product_description: data.product_description,
      product_img_url: downloadUrl,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    await addDoc(collectionRef, dataToAdd);

    return [true];
  } catch (error) {
    return [false, error];
  }
};

const DeleteProduct = async (id_product, product_file_name, collectionName) => {
  try {
    const imgRef = ref(storage, `product/${product_file_name}`);
    await deleteObject(imgRef);

    const q = query(
      collection(fireStore, collectionName),
      where("id", "==", id_product)
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    return [true];
  } catch (error) {
    return [false, error];
  }
};

const UpdateProduct = async (
  updatedData,
  updatedImages,
  collectionName,
  res
) => {
  try {
    const dataToUpdate = {
      product_category: updatedData.product_category,
      product_description: updatedData.product_description,
      product_expired: updatedData.product_expired,
      product_name: updatedData.product_name,
      product_price: parseInt(updatedData.product_price),
      product_stock: parseInt(updatedData.product_stock),
      product_unit: updatedData.product_unit,
    };

    if (updatedImages) {
      // Detete Images Product
      const storageRef = ref(
        storage,
        `product/${updatedData.product_img_file_name}`
      );
      await deleteObject(storageRef);

      // Add again images product
      const snapShot = await uploadBytesResumable(
        storageRef,
        updatedImages.buffer,
        {
          contentType: updatedImages.mimetype,
        }
      );

      const downloadUrl = await getDownloadURL(snapShot.ref);

      // Add update product data
      const q = query(
        collection(fireStore, collectionName),
        where("id", "==", updatedData.id)
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        const docRef = doc.ref;
        await updateDoc(docRef, {
          ...dataToUpdate,
          product_img_url: downloadUrl, // Update URL gambar product
        });
      });

      return [true];
    } else {
      // Add update product data
      const q = query(
        collection(fireStore, collectionName),
        where("id", "==", updatedData.id)
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        const docRef = doc.ref;
        await updateDoc(docRef, dataToUpdate);
      });

      return [true];
    }
  } catch (error) {
    return [false, error];
  }
};

module.exports = {
  GetProduct,
  AddProduct,
  DeleteProduct,
  UpdateProduct,
  Login,
};
