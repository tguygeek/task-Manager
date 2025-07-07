<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
    /**
     * Handle user registration.
     */
    function register(Request $request) {
        $request->validate([
        'name' => 'required|string',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6',
        ]);
        $user = \App\Models\User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => bcrypt($request->password),
        ]);

        Auth::login($user);

        return response()->json(['message' => 'Inscription réussie'], 200);
    }

    /**
     * Handle user login.
     */
    function login(Request $request){
        $credentials = $request->only('email','password');
        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        return response()->json(['message' => 'Connexion réussie']);

    }

    /**
     * Handle user logout.
     */
    function logout(Request $request){
        auth::logout();

        return response()->json(['message' => "deconexion reussie"]);
    }
}
