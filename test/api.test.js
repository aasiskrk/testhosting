const request = require("supertest");
const app = require("../index");

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YjQ4MzM1MzUwMGFjMjdlYWRkNGNlZCIsImlhdCI6MTcyMzIyNDM4Nn0.170VW2NY_zgEvQ0srXmNxIfGmSRRbxNmG2qOl_1Z2sI";

describe("API Test Collection", () => {
  // Test for user registration
  it("POST /api/user/create | Register new user", async () => {
    const response = await request(app).post("/api/user/create").send({
      fullName: "John Doe",
      email: "johndoe@gmail.com",
      phone: 1234567890,
      password: "password123",
      address: "123 Main St",
    });

    if (!response.body.success) {
      expect(response.body.message).toEqual("User already exists!");
    } else {
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toEqual("User Created successfully!");
    }
  });

  // Test for user login
  it("POST /api/user/login | User login", async () => {
    const response = await request(app).post("/api/user/login").send({
      email: "johndoe@gmail.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  // Test for creating a new forum post
  it("POST /api/forum/create | Create a new forum post", async () => {
    const response = await request(app)
      .post("/api/forum/create")
      .set("authorization", `Bearer ${token}`)
      .send({
        postPicture: "1717241320867-wp4020175-dedsec-wallpapers.jpg",
        postTitle: "Test Post",
        postDescription: "This is a test post description",
        postTags: ["test", "post"],
        postedUser: "66b483353500ac27eadd4ced", // Example user ID
        postedFullname: "John Doe",
      });

    if (!response.body.success) {
      expect(response.body.message).toEqual("Image not found!");
    } else {
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toEqual("Post created successfully!");
    }
  });

  // Test for fetching a single post
  it("GET /api/forum/get_single_post/:id | Fetch a single forum post", async () => {
    const postId = "60d0fe4f5311236168a109ca"; // Example post ID
    const response = await request(app)
      .get(`/api/forum/get_single_post/${postId}`)
      .set("authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("post");
  });

  // Test for fetching all posts
  it("GET /api/forum/get_all_post | Fetch all forum posts", async () => {
    const response = await request(app)
      .get("/api/forum/get_all_post")
      .set("authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("posts");
  });

  // Test for adding a comment to a post
  it("POST /api/forum/add_comment/:postId | Add a comment to a post", async () => {
    const postId = "666793eeaf7458f0542522a67"; // Example post ID
    const response = await request(app)
      .post(`/api/forum/add_comment/${postId}`)
      .set("authorization", `Bearer ${token}`)
      .send({
        comment: "This is a test comment",
        userId: "66b483353500ac27eadd4ced",
        userName: "Aashista Karki",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual("Comment added successfully!");
  });

  // Test for liking a post
  it("POST /api/forum/:postId/like | Like a post", async () => {
    const postId = "666793eeaf7458f0542522a67"; // Example post ID
    const response = await request(app)
      .post(`/api/forum/${postId}/like`)
      .set("authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual("Post liked successfully!");
  });

  // Test for deleting a post
  it("DELETE /api/forum/delete_post/:postId | Delete a forum post", async () => {
    const postId = "66b48b58eb12af8a986ff989"; // Example post ID
    const response = await request(app)
      .delete(`/api/forum/delete_post/${postId}`)
      .set("authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual("Post deleted successfully!");
  });

  it("GET /api/user/get_all_users | Get all users for admin", async () => {
    const response = await request(app).get("/api/user/get_all_users");

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toEqual("Users fetched successfully");
  });
});
